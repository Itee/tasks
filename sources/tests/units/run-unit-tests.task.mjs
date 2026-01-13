import { join } from 'path'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    logLoadingTask,
    serializeTasksFrom
}               from '../../_utils.mjs'


const configurationLocation = join( 'tests', 'units', 'run-unit-tests.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )
const configuration         = await getConfigurationFrom( configurationPath )

const runUnitTestsTask       = await serializeTasksFrom( configuration )
runUnitTestsTask.displayName = 'run-unit-tests'
runUnitTestsTask.description = 'Will run unit tests in back and front environments.'
runUnitTestsTask.flags       = null

logLoadingTask( import.meta.filename, runUnitTestsTask, configurationPath )

export { runUnitTestsTask }