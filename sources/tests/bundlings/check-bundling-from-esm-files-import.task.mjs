import colors     from 'ansi-colors'
import log        from 'fancy-log'
import {
    existsSync,
    mkdirSync,
    rmSync,
    writeFileSync
}                 from 'fs'
import { glob }   from 'glob/dist/esm/index.d.ts'
import {
    basename,
    dirname,
    join,
    normalize,
    parse,
    relative
}                 from 'path'
import { rollup } from 'rollup'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    logLoadingTask,
    packageSourcesDirectory,
    packageTestsBundlesDirectory
}                 from '../../_utils.mjs'

const {
          red,
          green,
          magenta,
      } = colors

const configurationLocation = join( 'tests', 'bundlings', 'check-bundling-from-esm-files-import.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )

const checkBundlingFromEsmFilesImportTask       = async ( done ) => {

    const outputDir      = join( packageTestsBundlesDirectory, 'from_files_import' )
    const temporariesDir = join( outputDir, '.tmp' )

    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const configuration = await getConfigurationFrom( configurationPath )

    // Get source files to process
    const pattern     = join( packageSourcesDirectory, '**' )
    const sourceFiles = glob.sync( pattern )
                            .map( filePath => normalize( filePath ) )
                            .filter( filePath => {
                                const fileName         = basename( filePath )
                                const isJsFile         = fileName.endsWith( '.js' )
                                const isNotPrivateFile = !fileName.startsWith( '_' )
                                const isNotIgnoredFile = !configuration.ignoredFiles.includes( fileName )
                                return isJsFile && isNotPrivateFile && isNotIgnoredFile
                            } )

    for ( let sourceFile of sourceFiles ) {

        const {
                  dir:  sourceDir,
                  base: sourceBase,
                  name: sourceName
              }                = parse( sourceFile )
        const specificFilePath = sourceFile.replace( packageSourcesDirectory, '' )
        const specificDir      = dirname( specificFilePath )

        // Create temp import file per file in package
        const temporaryFileName = `${ sourceName }.import.js`
        const temporaryDir      = join( temporariesDir, specificDir )
        const temporaryFile     = join( temporaryDir, temporaryFileName )
        const importDir         = relative( temporaryDir, sourceDir )
        const importFile        = join( importDir, sourceBase )
        const temporaryFileData = `import '${ importFile.replace( /\\/g, '/' ) }'`

        // Bundle tmp file and check content for side effects
        const bundleFileName = `${ sourceName }.bundle.js`
        const bundleFilePath = join( outputDir, specificDir, bundleFileName )

        configuration.buildOptions.input       = temporaryFile
        configuration.buildOptions.output.file = bundleFilePath

        // create tmp file
        try {

            mkdirSync( temporaryDir, { recursive: true } )
            writeFileSync( temporaryFile, temporaryFileData )

            const bundle     = await rollup( configuration.buildOptions )
            const { output } = await bundle.generate( configuration.buildOptions.output )

            let code = output[ 0 ].code
            if ( code.length > 1 ) {
                log( red( `[${ specificFilePath }] contain side-effects !` ) )
                await bundle.write( configuration.buildOptions.output )
            } else {
                log( green( `[${ specificFilePath }] is side-effect free.` ) )
            }

        } catch ( error ) {
            log( red( error.message ) )
        }

    }

    done()

}
checkBundlingFromEsmFilesImportTask.displayName = 'check-bundling-from-esm-files-import'
checkBundlingFromEsmFilesImportTask.description = 'In view to detect bundling side effects this task will create intermediary file for each individual export from this package and then create rollup config for each of them and bundle'
checkBundlingFromEsmFilesImportTask.flags       = null

logLoadingTask( import.meta.filename, checkBundlingFromEsmFilesImportTask, configurationPath )

export { checkBundlingFromEsmFilesImportTask }