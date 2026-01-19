import colors       from 'ansi-colors'
import log          from 'fancy-log'
import { basename } from 'node:path'
import { rollup }   from 'rollup'
import {
    getTaskConfigurationFor,
    logLoadingTask,
}                   from '../_utils.mjs'

logLoadingTask( import.meta.filename )

const {
          red,
          green,
          yellow,
      } = colors

const buildTask       = async ( done ) => {

    const configuration = await getTaskConfigurationFor( import.meta.filename )

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
buildTask.displayName = basename( import.meta.filename, '.task.mjs' )
buildTask.description = 'Todo...'
buildTask.flags       = null

export { buildTask }
