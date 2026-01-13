import colors          from 'ansi-colors'
import { deleteAsync } from 'del'
import log             from 'fancy-log'
import { join }        from 'path'
import {
    getConfigurationFrom,
    getConfigurationPathFor,
    logLoadingTask
}                      from '../_utils.mjs'

const { red }  = colors

const configurationLocation = join( 'cleans', 'clean.conf.mjs' )
const configurationPath     = getConfigurationPathFor( configurationLocation )
const configuration         = await getConfigurationFrom( configurationPath )

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
cleanTask.displayName = 'clean'
cleanTask.description = 'Will delete builds and temporary folders'
cleanTask.flags       = null

logLoadingTask( import.meta.filename, cleanTask, configurationPath )

export { cleanTask }
