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

        try {

            const { stdout } = await execFile( 'npx', [ 'eslint', '--config', defaultConfigurationPath, '--fix' ] )
            if ( stdout !== '' ) {
                log( stdout )
            }

            done()

        } catch ( error ) {

            log( error.stdout )
            done( red( error.message ) )

        }

    }

}
lintTask.displayName = 'lint'
lintTask.description = 'Will lint the sources files and try to fix the style when possible.'
lintTask.flags       = null

const taskPath                  = relative( packageRootDirectory, import.meta.filename )
const relativeConfigurationPath = relative( packageRootDirectory, configurationPath )
log( `Loading  ${ green( taskPath ) } with task ${ blue( lintTask.displayName ) } and configuration from ${ cyan( relativeConfigurationPath ) }` )

export { lintTask }