import log                      from 'fancy-log'
import {
    basename,
    relative
}                               from 'node:path'
import {
    blue,
    green
}                               from './colors.mjs'
import { packageRootDirectory } from './packages.mjs'

/* global process */
const isDebugging = ( process && process.env && process.env.RUNNER_DEBUG && process.env.RUNNER_DEBUG === '1' )


function logLoadingTask( filename ) {

    if ( !isDebugging ) {
        return
    }

    const taskPath = relative( packageRootDirectory, filename )
    const taskName = basename( filename, '.task.mjs' )

    log( `Loading  ${ green( taskPath ) } with task ${ blue( taskName ) }` )

}


export {
    log,
    logLoadingTask
}