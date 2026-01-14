import { basename } from 'node:path'
import {
    getTaskConfigurationFor,
    logLoadingTask,
    serializeTasksFrom
}                   from '../../_utils.mjs'

logLoadingTask( import.meta.filename )

const configuration          = await getTaskConfigurationFor( import.meta.filename )
const runUnitTestsTask       = await serializeTasksFrom( configuration )
runUnitTestsTask.displayName = basename( import.meta.filename, '.task.mjs' )
runUnitTestsTask.description = 'Will run unit tests in back and front environments.'
runUnitTestsTask.flags       = null

export { runUnitTestsTask }