import { join } from 'path'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    logLoadingTask,
    serializeTasksFrom
}               from '../../_utils.mjs'


const configurationLocation = join( 'tests', 'benchmarks', 'run-benchmarks.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )
const configuration         = await getConfigurationFrom( configurationPath )

const runBenchmarksTestsTask       = await serializeTasksFrom( configuration )
runBenchmarksTestsTask.displayName = 'run-benchmarks'
runBenchmarksTestsTask.description = 'Will run benchmarks in back and front environments.'
runBenchmarksTestsTask.flags       = null

logLoadingTask( import.meta.filename, runBenchmarksTestsTask, configurationPath )

export { runBenchmarksTestsTask }