import colors     from 'ansi-colors'
import log        from 'fancy-log'
import {
    existsSync,
    rmSync
}                 from 'fs'
import { glob }   from 'glob'
import {
    basename,
    dirname,
    extname,
    join,
    normalize
} from 'path'
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
checkBundlingFromEsmFilesDirectTask.displayName = 'check-bundling-from-esm-files-direct'
checkBundlingFromEsmFilesDirectTask.description = 'In view to detect bundling side effects this task will create intermediary file for each individual export from this package and then create rollup config for each of them and bundle'
checkBundlingFromEsmFilesDirectTask.flags       = null

logLoadingTask( import.meta.filename, checkBundlingFromEsmFilesDirectTask, configurationPath )

export { checkBundlingFromEsmFilesDirectTask }