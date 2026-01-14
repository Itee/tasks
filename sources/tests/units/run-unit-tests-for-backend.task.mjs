import colors         from 'ansi-colors'
import { spawn }      from 'child_process'
import log            from 'fancy-log'
import { existsSync } from 'fs'
import { basename }   from 'node:path'
import { join }       from 'path'
import {
    logLoadingTask,
    packageName,
    packageNodeModulesDirectory,
    packageTestsUnitsDirectory
}                     from '../../_utils.mjs'

logLoadingTask( import.meta.filename )

const {
          red,
          yellow,
      } = colors

/**
 * @description Will run unit tests with node
 */
const runUnitTestsForBackendTask       = ( done ) => {

    const testsPath = join( packageTestsUnitsDirectory, `/${ packageName }.units.mjs` )
    if ( !existsSync( testsPath ) ) {
        log( yellow( `${ testsPath } does not exist, skip backend unit tests...` ) )
        done()
        return
    }

    const mochaPath = join( packageNodeModulesDirectory, '/mocha/bin/mocha' )
    const mocha     = spawn( 'node', [ mochaPath, testsPath ], { stdio: 'inherit' } )
    mocha.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( red( `mocha exited with code ${ code }` ) )

    } )

}
runUnitTestsForBackendTask.displayName = basename( import.meta.filename, '.task.mjs' )
runUnitTestsForBackendTask.description = 'Will run unit tests with node'
runUnitTestsForBackendTask.flags       = null

export { runUnitTestsForBackendTask }