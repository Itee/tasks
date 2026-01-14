import { basename } from 'node:path'
import {
    getTaskConfigurationFor,
    logLoadingTask,
    serializeTasksFrom
}                   from '../../_utils.mjs'

logLoadingTask( import.meta.filename )

const configuration                = await getTaskConfigurationFor( import.meta.filename )
const runBenchmarksTestsTask       = await serializeTasksFrom( configuration )
runBenchmarksTestsTask.displayName = basename( import.meta.filename, '.task.mjs' )
runBenchmarksTestsTask.description = 'Will run benchmarks in back and front environments.'
runBenchmarksTestsTask.flags       = null

export { runBenchmarksTestsTask }