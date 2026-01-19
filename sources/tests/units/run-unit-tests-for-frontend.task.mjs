import { startTestRunner } from '@web/test-runner'
import colors              from 'ansi-colors'
import { basename }        from 'node:path'
import {
    getTaskConfigurationFor,
    logLoadingTask
}                          from '../../_utils.mjs'

logLoadingTask( import.meta.filename )

const { red } = colors

/**
 * @description Will run unit tests with web-test-runner
 */
const runUnitTestsForFrontendTask       = async () => {

    const configuration = await getTaskConfigurationFor( import.meta.filename )
    const testRunner    = await startTestRunner( {
        config:          configuration,
        readCliArgs:     false,
        readFileConfig:  false,
        autoExitProcess: false,
    } )

    return new Promise( ( resolve, reject ) => {

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
runUnitTestsForFrontendTask.displayName = basename( import.meta.filename, '.task.mjs' )
runUnitTestsForFrontendTask.description = 'Will run unit tests with web-test-runner'
runUnitTestsForFrontendTask.flags       = null

export { runUnitTestsForFrontendTask }