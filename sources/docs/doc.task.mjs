import colors        from 'ansi-colors'
import log           from 'fancy-log'
import child_process from 'node:child_process'
import { promisify } from 'node:util'
import {
    join,
    relative
}                    from 'path'
import {
    getConfigurationPathFor,
    packageRootDirectory
}                    from '../_utils.mjs'

const execFile = promisify( child_process.execFile )
const {
          red,
          green,
          blue,
          cyan
      }        = colors

const configurationLocation = join( 'docs', 'doc.conf.json' )
const configurationPath     = getConfigurationPathFor( configurationLocation )

/**
 * @method npm run doc
 * @global
 * @description Will generate this documentation
 */
const docTask       = async ( done ) => {

    try {
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

        try {
            const { stdout } = await execFile(
                './node_modules/.bin/jsdoc',
                [
                    '--configure', defaultConfigurationPath,
                    '--destination', './docs'
                ]
            )
            log( stdout )
            done()
        } catch ( error ) {
            done( red( error.message ) )
        }

    }

}
docTask.displayName = 'doc'
docTask.description = 'Will generate this documentation.'
docTask.flags       = null

const taskPath                  = relative( packageRootDirectory, import.meta.filename )
const relativeConfigurationPath = relative( packageRootDirectory, configurationPath )
log( `Loading  ${ green( taskPath ) } with task ${ blue( docTask.displayName ) } and configuration from ${ cyan( relativeConfigurationPath ) }` )

export { docTask }