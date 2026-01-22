import {
    existsSync,
    mkdirSync,
    rmSync,
    writeFileSync
}                                   from 'node:fs'
import {
    basename,
    dirname,
    join,
    parse,
    relative
}                                   from 'node:path'
import { rollup }                   from 'rollup'
import {
    green,
    magenta,
    red
}                                   from '../../utils/colors.mjs'
import { getJavascriptSourceFiles } from '../../utils/files.mjs'
import {
    log,
    logLoadingTask
}                                   from '../../utils/loggings.mjs'
import {
    packageSourcesDirectory,
    packageTestsBundlesDirectory
}                                   from '../../utils/packages.mjs'
import { getTaskConfigurationFor }  from '../../utils/tasks.mjs'

logLoadingTask( import.meta.filename )

const checkBundlingFromEsmFilesImportTask       = async ( done ) => {

    const outputDir      = join( packageTestsBundlesDirectory, 'from_files_import' )
    const temporariesDir = join( outputDir, '.tmp' )

    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const configuration = await getTaskConfigurationFor( import.meta.filename )
    const sourceFiles   = getJavascriptSourceFiles( configuration.ignoredFiles )

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
checkBundlingFromEsmFilesImportTask.displayName = basename( import.meta.filename, '.task.mjs' )
checkBundlingFromEsmFilesImportTask.description = 'In view to detect bundling side effects this task will create intermediary file for each individual export from this package and then create rollup config for each of them and bundle'
checkBundlingFromEsmFilesImportTask.flags       = null

export { checkBundlingFromEsmFilesImportTask }