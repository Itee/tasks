import { deleteAsync }             from 'del'
import { basename }                from 'node:path'
import { red }                     from '../utils/colors.mjs'
import {
    log,
    logLoadingTask
}                                  from '../utils/loggings.mjs'
import { getTaskConfigurationFor } from '../utils/tasks.mjs'

logLoadingTask( import.meta.filename )

const configuration = await getTaskConfigurationFor( import.meta.filename )

/**
 * @method npm run clean
 * @global
 * @description Will delete builds and temporary folders
 */
const cleanTask       = () => deleteAsync( configuration, {
    onProgress: progress => {
        const path    = progress.path || 'Nothing to clean...'
        const percent = Math.round( progress.percent * 100 )
        const spacer  = percent === 100 ? '' : ' '
        log( `Deleting [${ progress.deletedCount }/${ progress.totalCount }]<${ percent }%>${ spacer }:`, red( path ) )
    }
} )
cleanTask.displayName = basename( import.meta.filename, '.task.mjs' )
cleanTask.description = 'Will delete builds and temporary folders'
cleanTask.flags       = null

export { cleanTask }
