import { basename }       from 'node:path'
import { logLoadingTask } from '../../utils/loggings.mjs'
import {
    getTaskConfigurationFor,
    serializeTasksFrom
}                         from '../../utils/tasks.mjs'

logLoadingTask( import.meta.filename )

const configuration                = await getTaskConfigurationFor( import.meta.filename )
const runBenchmarksTestsTask       = await serializeTasksFrom( configuration )
runBenchmarksTestsTask.displayName = basename( import.meta.filename, '.task.mjs' )
runBenchmarksTestsTask.description = 'Will run benchmarks in back and front environments.'
runBenchmarksTestsTask.flags       = null

export { runBenchmarksTestsTask }