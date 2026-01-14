import colors         from 'ansi-colors'
import log            from 'fancy-log'
import { existsSync } from 'fs'
import { basename }   from 'node:path'
import { join }       from 'path'
import {
    logLoadingTask,
    packageName,
    packageTestsBenchmarksDirectory
}                     from '../../_utils.mjs'

logLoadingTask( import.meta.filename )

const {
          red,
          yellow
      } = colors

/**
 * @description Will run benchmarks with node
 */
const runBenchmarksForBackendTask       = async ( done ) => {

    const benchesPath = join( packageTestsBenchmarksDirectory, `/${ packageName }.benchmarks.js` )
    if ( !existsSync( benchesPath ) ) {
        log( yellow( `${ benchesPath } does not exist, skip backend benchmarks...` ) )
        done()
        return
    }

    try {
        await import(benchesPath)
        done()
    } catch ( error ) {
        done( red( error ) )
    }

}
runBenchmarksForBackendTask.displayName = basename( import.meta.filename, '.task.mjs' )
runBenchmarksForBackendTask.description = 'Will run benchmarks with node'
runBenchmarksForBackendTask.flags       = null

export { runBenchmarksForBackendTask }