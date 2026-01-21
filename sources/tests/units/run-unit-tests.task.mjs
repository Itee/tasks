import { basename }        from 'node:path'
import { logLoadingTask, } from '../../utils/loggings.mjs'
import {
    getTaskConfigurationFor,
    serializeTasksFrom
}                          from '../../utils/tasks.mjs'

logLoadingTask( import.meta.filename )

const configuration          = await getTaskConfigurationFor( import.meta.filename )
const runUnitTestsTask       = await serializeTasksFrom( configuration )
runUnitTestsTask.displayName = basename( import.meta.filename, '.task.mjs' )
runUnitTestsTask.description = 'Will run unit tests in back and front environments.'
runUnitTestsTask.flags       = null

export { runUnitTestsTask }