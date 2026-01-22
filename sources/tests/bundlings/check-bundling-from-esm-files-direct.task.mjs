import {
    existsSync,
    rmSync
}                                   from 'node:fs'
import {
    basename,
    dirname,
    extname,
    join
}                                   from 'node:path'
import { rollup }                   from 'rollup'
import {
    green,
    magenta,
    red,
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

/**
 * @description In view to detect bundling side effects this task will
 * create intermediary file for each individual export from this package
 * and then create rollup config for each of them and bundle
 * Todo: Check for different target env like next task below this one
 */
const checkBundlingFromEsmFilesDirectTask       = async ( done ) => {

    const outputDir = join( packageTestsBundlesDirectory, 'from_files_direct' )
    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const configuration = await getTaskConfigurationFor( import.meta.filename )
    const sourceFiles   = getJavascriptSourceFiles( configuration.ignoredFiles )

    for ( let sourceFile of sourceFiles ) {

        const specificFilePath = sourceFile.replace( packageSourcesDirectory, '' )
        const specificDir      = dirname( specificFilePath )
        const fileName         = basename( sourceFile, extname( sourceFile ) )

        const bundleFileName = `${ fileName }.bundle.js`
        const bundleFilePath = join( outputDir, specificDir, bundleFileName )

        configuration.buildOptions.input       = sourceFile
        configuration.buildOptions.output.file = bundleFilePath

        try {

            log( 'Bundling', green( configuration.buildOptions.output.file ) )

            const bundle = await rollup( configuration.buildOptions )
            await bundle.generate( configuration.buildOptions.output )
            await bundle.write( configuration.buildOptions.output )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    done()

}
checkBundlingFromEsmFilesDirectTask.displayName = basename( import.meta.filename, '.task.mjs' )
checkBundlingFromEsmFilesDirectTask.description = 'In view to detect bundling side effects this task will create intermediary file for each individual export from this package and then create rollup config for each of them and bundle'
checkBundlingFromEsmFilesDirectTask.flags       = null

export { checkBundlingFromEsmFilesDirectTask }