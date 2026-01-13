import colors     from 'ansi-colors'
import log        from 'fancy-log'
import {
    existsSync,
    mkdirSync,
    rmSync,
    writeFileSync
}                 from 'fs'
import {
    dirname,
    join,
    parse,
    relative
}                 from 'path'
import { rollup } from 'rollup'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    logLoadingTask,
    packageSourcesDirectory as sourcesDir,
    packageTestsBundlesDirectory as bundleDir
}                 from '../../_utils.mjs'

const {
          red,
          green,
          magenta,
      } = colors

const sourcesFilesLocation = join( 'tests', 'bundlings', 'check-bundling.conf.mjs' )
const sourcesFilesPath     = getConfigurationPathFor( sourcesFilesLocation )

const configurationLocation = join( 'tests', 'bundlings', 'check-bundling-from-esm-files-import.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )

const checkBundlingFromEsmFilesImportTask       = async ( done ) => {

    const outputDir      = join( bundleDir, 'from_files_import' )
    const temporariesDir = join( outputDir, '.tmp' )

    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const sourcesFiles  = await getConfigurationFrom( sourcesFilesPath )
    const configuration = await getConfigurationFrom( configurationPath )

    for ( let sourceFile of sourcesFiles ) {

        const {
                  dir:  sourceDir,
                  base: sourceBase,
                  name: sourceName
              }                = parse( sourceFile )
        const specificFilePath = sourceFile.replace( sourcesDir, '' )
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

        configuration.input       = temporaryFile
        configuration.output.file = bundleFilePath

        // create tmp file
        try {

            mkdirSync( temporaryDir, { recursive: true } )
            writeFileSync( temporaryFile, temporaryFileData )

            const bundle     = await rollup( configuration )
            const { output } = await bundle.generate( configuration.output )

            let code = output[ 0 ].code
            if ( code.length > 1 ) {
                log( red( `[${ specificFilePath }] contain side-effects !` ) )
                await bundle.write( configuration.output )
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