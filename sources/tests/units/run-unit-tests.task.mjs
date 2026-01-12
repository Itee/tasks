import colors from 'ansi-colors'
import log    from 'fancy-log'
import {
    join,
    relative
}             from 'path'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    packageRootDirectory,
    serializeTasksFrom
}             from '../../_utils.mjs'

const {
          green,
          blue,
          cyan
      } = colors

const configurationLocation = join( 'tests', 'units', 'run-unit-tests.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )
const configuration         = await getConfigurationFrom( configurationPath )

const runUnitTestsTask       = await serializeTasksFrom( configuration )
runUnitTestsTask.displayName = 'run-unit-tests'
runUnitTestsTask.description = 'Will run unit tests in back and front environments.'
runUnitTestsTask.flags       = null

const taskPath                  = relative( packageRootDirectory, import.meta.filename )
const relativeConfigurationPath = relative( packageRootDirectory, configurationPath )
log( `Loading  ${ green( taskPath ) } with task ${ blue( runUnitTestsTask.displayName ) } and configuration from ${ cyan( relativeConfigurationPath ) }` )

export { runUnitTestsTask }