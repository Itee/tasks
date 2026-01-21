import { basename }                from 'node:path'
import { rollup }                  from 'rollup'
import {
    green,
    red,
    yellow,
}                                  from '../utils/colors.mjs'
import {
    log,
    logLoadingTask
}                                  from '../utils/loggings.mjs'
import { getTaskConfigurationFor } from '../utils/tasks.mjs'

logLoadingTask( import.meta.filename )

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
buildTask.description = 'Will generate build package files based on input config.'
buildTask.flags       = null

export { buildTask }
