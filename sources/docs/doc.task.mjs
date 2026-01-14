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

const execFile = promisify( child_process.execFile )
const { red }  = colors

/**
 * @method npm run doc
 * @global
 * @description Will generate this documentation
 */
const docTask       = async ( done ) => {

    try {

        const configurationPath = getTaskConfigurationPathFor( import.meta.filename )

        const { stdout } = await execFile(
            './node_modules/.bin/jsdoc',
            [
                '--configure', configurationPath,
                '--destination', './docs'
            ]
        )
        log( stdout )
        done()

    } catch ( error ) {

        done( red( error.message ) )

    }

}
docTask.displayName = basename( import.meta.filename, '.task.mjs' )
docTask.description = 'Will generate this documentation.'
docTask.flags       = null

export { docTask }