import { spawn }      from 'node:child_process'
import { existsSync } from 'node:fs'
import {
    basename,
    join
}                     from 'node:path'
import {
    red,
    yellow
}                     from '../../utils/colors.mjs'
import {
    log,
    logLoadingTask
}                     from '../../utils/loggings.mjs'
import {
    getUnscopedPackageName,
    packageNodeModulesDirectory,
    packageTestsUnitsDirectory
}                     from '../../utils/packages.mjs'

logLoadingTask( import.meta.filename )

/**
 * @description Will run unit tests with node
 */
const runUnitTestsForBackendTask       = ( done ) => {

    const testsPath = join( packageTestsUnitsDirectory, `/${ getUnscopedPackageName() }.units.mjs` )
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