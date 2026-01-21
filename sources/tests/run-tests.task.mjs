import { series }                 from 'gulp'
import { basename }               from 'node:path'
import { logLoadingTask }         from '../utils/loggings.mjs'
import { runBenchmarksTestsTask } from './benchmarks/run-benchmarks.task.mjs'
import { runUnitTestsTask }       from './units/run-unit-tests.task.mjs'

logLoadingTask( import.meta.filename )

/**
 * @method npm run test
 * @global
 * @description Will run unit tests and benchmarks for backend (node) and frontend (web-test-runner) environments
 */
const runTestsTask       = series(
    runBenchmarksTestsTask,
    runUnitTestsTask,
)
runTestsTask.displayName = basename( import.meta.filename, '.task.mjs' )
runTestsTask.description = 'Will run unit tests and benchmarks for backend (node) and frontend (web-test-runner) environments.'
runTestsTask.flags       = null

export { runTestsTask }