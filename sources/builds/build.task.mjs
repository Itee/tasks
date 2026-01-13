import colors     from 'ansi-colors'
import log        from 'fancy-log'
import { join }   from 'path'
import { rollup } from 'rollup'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    logLoadingTask
}                 from '../_utils.mjs'

const {
          red,
          green,
          yellow,
      } = colors

const configurationLocation = join( 'builds', 'build.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )

const buildTask       = async ( done ) => {

    const configuration = await getConfigurationFrom( configurationPath )
    for ( let config of configuration ) {

        if ( config === undefined || config === null || config.length === 0 ) {
            log( yellow( 'Empty configuration object... Skip it!' ) )
            continue
        }

        log( 'Building', green( config.output.file ) )

        try {

            const bundle = await rollup( config )
            await bundle.write( config.output )

        } catch ( error ) {

            done( red( error.message ) )
            return

        }

    }

    done()

}
buildTask.displayName = 'build'
buildTask.description = 'Todo...'
buildTask.flags       = null

logLoadingTask( import.meta.filename, buildTask, configurationPath )

export { buildTask }
