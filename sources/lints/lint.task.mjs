import colors        from 'ansi-colors'
import log           from 'fancy-log'
import child_process from 'node:child_process'
import { promisify } from 'node:util'
import { join }      from 'path'
import {
    getConfigurationPathFor,
    logLoadingTask
}                    from '../_utils.mjs'

const execFile = promisify( child_process.execFile )
const { red }        = colors

const configurationLocation = join( 'lints', 'lint.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
const lintTask       = async ( done ) => {

    try {

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
lintTask.displayName = 'lint'
lintTask.description = 'Will lint the sources files and try to fix the style when possible.'
lintTask.flags       = null

logLoadingTask( import.meta.filename, lintTask, configurationPath )

export { lintTask }