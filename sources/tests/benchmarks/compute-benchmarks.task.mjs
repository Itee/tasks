import colors       from 'ansi-colors'
import childProcess from 'child_process'
import log          from 'fancy-log'
import { glob }     from 'glob/dist/esm/index.d.ts'
import {
    basename,
    dirname,
    extname,
    join,
    normalize,
    relative
}                   from 'path'
import {
    createDirectoryIfNotExist,
    createFile,
    getConfigurationFrom,
    getConfigurationPathFor,
    logLoadingTask,
    packageName,
    packageNodeModulesDirectory,
    packageSourcesDirectory,
    packageTestsBenchmarksDirectory,
    packageTestsDirectory
}                   from '../../_utils.mjs'

const {
          red,
          yellow,
      } = colors

const configurationLocation = join( 'tests', 'benchmarks', 'compute-benchmarks.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )
const configuration         = await getConfigurationFrom( configurationPath )

/**
 * @description Will generate benchmarks files from source code against provided alternatives
 */
const computeBenchmarksTask       = ( done ) => {

    createDirectoryIfNotExist( packageTestsBenchmarksDirectory )

    // Get task configuration
    const filePathsToIgnore = configuration

    // Get source files to process
    const pattern     = join( packageSourcesDirectory, '**' )
    const sourceFiles = glob.sync( pattern )
                            .map( filePath => normalize( filePath ) )
                            .filter( filePath => {
                                const fileName         = basename( filePath )
                                const isJsFile         = fileName.endsWith( '.js' )
                                const isNotPrivateFile = !fileName.startsWith( '_' )
                                const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                return isJsFile && isNotPrivateFile && isNotIgnoredFile
                            } )

    const benchRootImports = []
    for ( let sourceFile of sourceFiles ) {

        const specificFilePath = sourceFile.replace( packageSourcesDirectory, '' )
        const specificDir      = dirname( specificFilePath )

        const fileName      = basename( sourceFile, extname( sourceFile ) )
        const benchFileName = `${ fileName }.bench.js`
        const benchDirPath  = join( packageTestsBenchmarksDirectory, specificDir )
        const benchFilePath = join( benchDirPath, benchFileName )

        const nsName         = `${ fileName }Namespace`
        const importDirPath  = relative( benchDirPath, packageSourcesDirectory )
        const importFilePath = join( importDirPath, specificFilePath ).replace( /\\/g, '/' )

        try {

            const jsdocPath   = join( packageNodeModulesDirectory, '/jsdoc/jsdoc.js' )
            const jsdocOutput = childProcess.execFileSync( 'node', [ jsdocPath, '-X', sourceFile ] ).toString()

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

                // We don't care that data bloc have comment they are unused to generate benchmarks
                // const undocumented = data.undocumented
                // if ( undocumented ) {
                //     return false
                // }

                const scope = data.scope
                if ( ![ 'global', 'static' ].includes( scope ) ) {
                    return false
                }

                if ( longName.includes( ' ' ) || longName.includes( '~' ) || usedLongnames.includes( longName ) ) {
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
            const wrapperDirPath          = relative( benchDirPath, packageTestsDirectory )
            const importBenchmarkFilePath = join( wrapperDirPath, 'import.benchmarks.js' )
            const importTestingFilePath   = join( wrapperDirPath, 'import.testing.js' )

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

    const benchesFilePath = join( packageTestsBenchmarksDirectory, `${ packageName }.benchmarks.js` )
    createFile( benchesFilePath, benchesTemplate )

    done()

}
computeBenchmarksTask.displayName = 'compute-benchmarks'
computeBenchmarksTask.description = 'Will generate benchmarks files from source code against provided alternatives.'
computeBenchmarksTask.flags       = null

logLoadingTask( import.meta.filename, computeBenchmarksTask, configurationPath )

export { computeBenchmarksTask }