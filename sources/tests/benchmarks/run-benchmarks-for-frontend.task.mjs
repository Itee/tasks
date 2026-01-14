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
 * @description Will run benchmarks with web-test-runner
 */
const runBenchmarksForFrontendTask       = () => {
    return new Promise( async ( resolve, reject ) => {

        const configuration = await getTaskConfigurationFor( import.meta.filename )
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
runBenchmarksForFrontendTask.displayName = basename( import.meta.filename, '.task.mjs' )
runBenchmarksForFrontendTask.description = 'Will run benchmarks with web-test-runner.'
runBenchmarksForFrontendTask.flags       = null

export { runBenchmarksForFrontendTask }