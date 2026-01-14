import colors          from 'ansi-colors'
import { deleteAsync } from 'del'
import log             from 'fancy-log'
import { basename }    from 'node:path'
import {
    getTaskConfigurationFor,
    logLoadingTask
}                      from '../_utils.mjs'

logLoadingTask( import.meta.filename )

const { red }       = colors
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
