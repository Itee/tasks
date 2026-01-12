import { startTestRunner } from '@web/test-runner'
import colors              from 'ansi-colors'
import log                 from 'fancy-log'
import {
    join,
    relative
}                          from 'path'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    packageRootDirectory
}                          from '../../_utils.mjs'

const {
          red,
          green,
          blue,
          cyan
      } = colors

const configurationLocation = join( 'tests', 'benchmarks', 'run-benchmarks-for-frontend.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )

/**
 * @description Will run benchmarks with web-test-runner
 */
const runBenchmarksForFrontendTask       = () => {
    return new Promise( async ( resolve, reject ) => {

        const configuration = await getConfigurationFrom( configurationPath )
        const testRunner    = await startTestRunner( {
            config:          configuration,
            readCliArgs:     false,
            readFileConfig:  false,
            autoExitProcess: false,
        } )

        if ( !testRunner ) {
            reject( red( 'Internal test runner error.' ) )
            return
        }

        // To ensure that testRunner exit event won't be used by other instance of test runner,
        // we need to be sure that current test runner is ended
        testRunner.on( 'finished', () => {
            testRunner.stop()
        } )

        testRunner.on( 'stopped', () => {
            resolve()
        } )

    } )
}
runBenchmarksForFrontendTask.displayName = 'run-benchmarks-for-frontend'
runBenchmarksForFrontendTask.description = 'Will run benchmarks with web-test-runner.'
runBenchmarksForFrontendTask.flags       = null

const taskPath                  = relative( packageRootDirectory, import.meta.filename )
const relativeConfigurationPath = relative( packageRootDirectory, configurationPath )
log( `Loading  ${ green( taskPath ) } with task ${ blue( runBenchmarksForFrontendTask.displayName ) } and configuration from ${ cyan( relativeConfigurationPath ) }` )

export { runBenchmarksForFrontendTask }