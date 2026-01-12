import colors     from 'ansi-colors'
import log        from 'fancy-log'
import {
    join,
    relative
}                 from 'path'
import { rollup } from 'rollup'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    packageRootDirectory
}                 from '../_utils.mjs'

const {
          red,
          green,
          blue,
          yellow,
          cyan
      } = colors

const configurationLocation = join( 'builds', 'build.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )
const configuration         = await getConfigurationFrom( configurationPath )

const buildTask       = async ( done ) => {

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

const taskPath                  = relative( packageRootDirectory, import.meta.filename )
const relativeConfigurationPath = relative( packageRootDirectory, configurationPath )
log( `Loading  ${ green( taskPath ) } with task ${ blue( buildTask.displayName ) } and configuration from ${ cyan( relativeConfigurationPath ) }` )

export { buildTask }
