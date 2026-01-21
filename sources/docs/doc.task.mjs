import child_process                   from 'node:child_process'
import { basename }                    from 'node:path'
import { promisify }                   from 'node:util'
import { red }                         from '../utils/colors.mjs'
import {
    log,
    logLoadingTask
}                                      from '../utils/loggings.mjs'
import { getTaskConfigurationPathFor } from '../utils/tasks.mjs'

logLoadingTask( import.meta.filename )

const execFile = promisify( child_process.execFile )

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