import { series }                 from 'gulp'
import { logLoadingTask }         from '../_utils.mjs'
import { runBenchmarksTestsTask } from './benchmarks/run-benchmarks.task.mjs'
import { runUnitTestsTask }       from './units/run-unit-tests.task.mjs'

/**
 * @method npm run test
 * @global
 * @description Will run unit tests and benchmarks for backend (node) and frontend (web-test-runner) environments
 */
const runTestsTask       = series(
    runBenchmarksTestsTask,
    runUnitTestsTask,
)
runTestsTask.displayName = 'run-tests'
runTestsTask.description = 'Will run unit tests and benchmarks for backend (node) and frontend (web-test-runner) environments.'
runTestsTask.flags       = null

logLoadingTask( import.meta.filename, runTestsTask )

export { runTestsTask }