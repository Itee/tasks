import colors        from 'ansi-colors'
import log           from 'fancy-log'
import child_process from 'node:child_process'
import { basename }  from 'node:path'
import { promisify } from 'node:util'
import {
    getTaskConfigurationPathFor,
    logLoadingTask
}                    from '../_utils.mjs'

logLoadingTask( import.meta.filename )

const _processCwd = process.cwd()
log(_processCwd)
log(process.env)

const execFile = promisify( child_process.execFile )
const { red }  = colors

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
const lintTask       = async ( done ) => {

    try {

        const configurationPath = getTaskConfigurationPathFor( import.meta.filename )

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