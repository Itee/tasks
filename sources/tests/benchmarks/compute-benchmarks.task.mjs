import childProcess                from 'node:child_process'
import {
    basename,
    dirname,
    extname,
    join,
    relative
}                                  from 'node:path'
import {
    red,
    yellow
}                                  from '../../utils/colors.mjs'
import {
    createDirectoryIfNotExist,
    createFile,
    getJavascriptSourceFiles,
}                                  from '../../utils/files.mjs'
import {
    log,
    logLoadingTask
}                                  from '../../utils/loggings.mjs'
import {
    getUnscopedPackageName,
    iteePackageSourcesDirectory,
    packageNodeModulesDirectory,
    packageSourcesDirectory,
    packageTestsBenchmarksDirectory
}                                  from '../../utils/packages.mjs'
import { getTaskConfigurationFor } from '../../utils/tasks.mjs'
import { toCamelCase }             from '../../utils/texts.mjs'

logLoadingTask( import.meta.filename )

/**
 * @description Will generate benchmarks files from source code against provided alternatives
 */
const computeBenchmarksTask       = async ( done ) => {

    createDirectoryIfNotExist( packageTestsBenchmarksDirectory )

    // Get task configuration
    const filePathsToIgnore = await getTaskConfigurationFor( import.meta.filename )
    const sourceFiles       = getJavascriptSourceFiles( filePathsToIgnore )

    const benchRootImports = []
    for ( let sourceFile of sourceFiles ) {

        const specificFilePath = sourceFile.replace( packageSourcesDirectory, '' )
        const specificDir      = dirname( specificFilePath )

        const fileName          = basename( sourceFile, extname( sourceFile ) )
        const camelCaseFileName = toCamelCase( fileName )
        const benchFileName     = `${ camelCaseFileName }.bench.js`
        const benchDirPath      = join( packageTestsBenchmarksDirectory, specificDir )
        const benchFilePath     = join( benchDirPath, benchFileName )

        const nsName         = `${ camelCaseFileName }Namespace`
        const importDirPath  = relative( benchDirPath, packageSourcesDirectory )
        const importFilePath = join( importDirPath, specificFilePath ).replace( /\\/g, '/' )

        try {

            const jsdocPath   = join( packageNodeModulesDirectory, '/jsdoc/jsdoc.js' )
            const jsdocOutput = childProcess.execFileSync( 'node', [ jsdocPath, '--explain', sourceFile ] ).toString()

            if ( jsdocOutput.includes( 'There are no input files to process' ) ) {
                log( 'Error   ', red( `${ sourceFile }, no input files to process` ) )
                continue
            }

            const classNames    = []
            const usedLongnames = []
            const jsonData      = JSON.parse( jsdocOutput ).filter( data => {

                const longName = data.longname

                const kind = data.kind
                if ( kind !== 'function' ) {
                    if ( kind === 'class' && !classNames.includes( longName ) ) {
                        classNames.push( longName )
                    }
                    return false
                }

                const scope = data.scope
                if ( ![ 'global', 'static' ].includes( scope ) ) {
                    return false
                }

                if ( longName.startsWith( '_' ) || longName.includes( ' ' ) || longName.includes( '~' ) || usedLongnames.includes( longName ) ) {
                    return false
                }

                const memberOf = data.memberof || ''
                if ( memberOf.includes( '.' ) ) {
                    return false
                }

                for ( let className of classNames ) {
                    if ( longName.includes( className ) ) {
                        return false
                    }
                }

                usedLongnames.push( longName )

                return true

            } )

            if ( jsonData.length === 0 ) {
                log( 'Ignoring', yellow( `${ sourceFile }, no usable exports found` ) )
                continue
            }

            // Compute benchmark suites by grouping logically function by name[_x]
            const suiteGroups = {}
            for ( let docData of jsonData ) {

                try {

                    const functionName = docData.name
                    const nameSplits   = functionName.split( '_' )
                    const rootName     = nameSplits[ 0 ]

                    if ( !( rootName in suiteGroups ) ) {
                        suiteGroups[ rootName ] = []
                    }

                    suiteGroups[ rootName ].push( functionName )

                } catch ( error ) {

                    log( red( error.message ) )

                }

            }

            // Generate suites
            let benchSuites       = ''
            const suitesToExports = []
            for ( let suiteGroupName in suiteGroups ) {
                suitesToExports.push( `${ suiteGroupName }Suite` )
                benchSuites += `const ${ suiteGroupName }Suite = Benchmark.Suite( '${ nsName }.${ suiteGroupName }', Testing.createSuiteOptions() )` + '\n'

                for ( let suiteGroupValue of suiteGroups[ suiteGroupName ] ) {
                    benchSuites += `                                     .add( '${ suiteGroupValue }()', Testing.iterateOverDataMap( ${ nsName }.${ suiteGroupValue } ), Testing.createBenchmarkOptions() )` + '\n'
                }

                benchSuites += '\n'
            }

            // compute relative level to get import wrappers
            const wrapperDirPath          = relative( benchDirPath, iteePackageSourcesDirectory )
            const importBenchmarkFilePath = join( wrapperDirPath, 'utils', 'benchmarks.js' )
            const importTestingFilePath   = join( wrapperDirPath, 'utils', 'testing.js' )

            const template = '' +
                `import * as ${ nsName } from '${ importFilePath }'` + '\n' +
                `import { getBenchmarkPackage } from '${ importBenchmarkFilePath }'` + '\n' +
                `import { getTestingPackage } from '${ importTestingFilePath }'` + '\n' +
                '\n' +
                `const Benchmark = await getBenchmarkPackage()` + '\n' +
                `const Testing   = await getTestingPackage()` + '\n' +
                '\n' +
                `${ benchSuites }` +
                // '\n' +
                `export { ${ suitesToExports } }` + '\n' +
                '\n'

            const importBenchFilePath = relative( packageTestsBenchmarksDirectory, benchFilePath ).replace( /\\/g, '/' )
            benchRootImports.push( {
                path:    importBenchFilePath,
                exports: suitesToExports
            } )

            createDirectoryIfNotExist( benchDirPath )
            createFile( benchFilePath, template )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    let templateImports = ''
    let suites          = []
    for ( let i = 0 ; i < benchRootImports.length ; i++ ) {

        const currentBench = benchRootImports[ i ]
        const namedExports = currentBench.exports
        const imports      = namedExports.join( ', ' )
        suites.push( ...namedExports )

        templateImports += `import {${ imports }} from './${ currentBench.path }'` + '\n'

    }

    // Use a fallback in case no benches were found at all
    if ( benchRootImports.length === 0 ) {
        log( 'Warning ', yellow( 'No usable exports found, generate default file to avoid frontend breakage.' ) )
        const defaultBenchesDir  = join( packageTestsBenchmarksDirectory, 'default' )
        const defaultBenchesPath = join( defaultBenchesDir, 'default.bench.js' )

        createDirectoryIfNotExist( defaultBenchesDir )
        createFile( defaultBenchesPath, '// Avoid web test runner crash on empty benches' )
    }

    const benchesTemplate = '' +
        `${ templateImports }` + '\n' +
        'const suites = [' + '\n' +
        `${ suites.map( suite => `\t${ suite }` ).join( ',\n' ) }` + '\n' +
        ']' + '\n' +
        '\n' +
        `for ( const suite of suites ) {` + '\n' +
        `\tsuite.run()` + '\n' +
        `}` + '\n'

    const benchesFilePath = join( packageTestsBenchmarksDirectory, `${ getUnscopedPackageName() }.benchmarks.js` )
    createFile( benchesFilePath, benchesTemplate )

    done()

}
computeBenchmarksTask.displayName = basename( import.meta.filename, '.task.mjs' )
computeBenchmarksTask.description = 'Will generate benchmarks files from source code against provided alternatives.'
computeBenchmarksTask.flags       = null

export { computeBenchmarksTask }