import child_process                   from 'node:child_process'
import { basename }                    from 'node:path'
import { promisify }                   from 'node:util'
import {
    cyan,
    red
}                                      from '../utils/colors.mjs'
import {
    log,
    logLoadingTask
}                                      from '../utils/loggings.mjs'
import { getTaskConfigurationPathFor } from '../utils/tasks.mjs'

logLoadingTask( import.meta.filename )

const execFile = promisify( child_process.execFile )

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
const lintTask       = async ( done ) => {

    try {

        const configurationPath = getTaskConfigurationPathFor( import.meta.filename )
        log( `Loading configuration from ${ cyan( configurationPath ) }` )

        const { stdout } = await execFile( 'npx', [ 'eslint', '--config', configurationPath, '--fix' ] )
        if ( stdout !== '' ) {
            log( stdout )
        }

        done()

    } catch ( error ) {

        log( error.stdout )
        done( red( error.message ) )

    }

}
lintTask.displayName = basename( import.meta.filename, '.task.mjs' )
lintTask.description = 'Will lint the sources files and try to fix the style when possible.'
lintTask.flags       = null

export { lintTask }