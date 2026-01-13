import colors     from 'ansi-colors'
import log        from 'fancy-log'
import {
    existsSync,
    rmSync
}                 from 'fs'
import {
    basename,
    dirname,
    extname,
    join
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

const sourcesFilesLocation = join( 'tests', 'bundlings', 'check-bundling.conf.mjs' )
const sourcesFilesPath     = getConfigurationPathFor( sourcesFilesLocation )

const configurationLocation = join( 'tests', 'bundlings', 'check-bundling-from-esm-files-direct.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )

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

    const sourcesFiles  = await getConfigurationFrom( sourcesFilesPath )
    const configuration = await getConfigurationFrom( configurationPath )

    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( packageSourcesDirectory, '' )
        const specificDir      = dirname( specificFilePath )
        const fileName         = basename( sourceFile, extname( sourceFile ) )

        const bundleFileName = `${ fileName }.bundle.js`
        const bundleFilePath = join( outputDir, specificDir, bundleFileName )

        configuration.input       = sourceFile
        configuration.output.file = bundleFilePath

        try {

            log( 'Bundling', green( configuration.output.file ) )

            const bundle = await rollup( configuration )
            await bundle.generate( configuration.output )
            await bundle.write( configuration.output )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    done()

}
checkBundlingFromEsmFilesDirectTask.displayName = 'check-bundling-from-esm-files-direct'
checkBundlingFromEsmFilesDirectTask.description = 'In view to detect bundling side effects this task will create intermediary file for each individual export from this package and then create rollup config for each of them and bundle'
checkBundlingFromEsmFilesDirectTask.flags       = null

logLoadingTask( import.meta.filename, checkBundlingFromEsmFilesDirectTask, configurationPath )

export { checkBundlingFromEsmFilesDirectTask }