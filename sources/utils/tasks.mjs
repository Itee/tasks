import {
    parallel,
    series
}                      from 'gulp'
import { existsSync }  from 'node:fs'
import {
    extname,
    join,
    relative
}                      from 'node:path'
import {
    blue,
    cyan,
    magenta,
    red,
}                      from './colors.mjs'
import { getJsonFrom } from './files.mjs'
import { log }         from './loggings.mjs'
import {
    iteePackageSourcesDirectory,
    packageRootDirectory,
    packageTasksConfigurationsDirectory,
    packageTasksDirectory
}                      from './packages.mjs'

async function getTasksFrom( taskFiles = [] ) {

    const tasks = []
    for ( const taskFile of taskFiles ) {
        const relativeTaskFile = relative( packageRootDirectory, taskFile )

        try {

            const module = await import(taskFile)

            const exportStrings = []
            for ( const moduleKey in module ) {
                const task = module[ moduleKey ]
                tasks.push( task )

                const name         = task.name ?? null
                const displayName  = task.displayName ?? null
                const fullName     = ( moduleKey !== name ) ? `${ blue( moduleKey ) }( ${ magenta( name ) } )` : `${ blue( name ) }`
                const exportAs     = ( displayName ) ? ` as ${ cyan( displayName ) }` : ''
                const exportString = fullName + exportAs
                exportStrings.push( exportString )
            }

            //log( 'Process ', green( relativeTaskFile ), `with task${ ( exportStrings.length > 1 ) ? 's' : '' }`, exportStrings.join( ', ' ) )

        } catch ( error ) {

            log( 'Error   ', red( relativeTaskFile ), error.message )

        }

    }

    return tasks

}

async function serializeTasksFrom( taskFiles = [] ) {

    const tasks = await getTasksFrom( taskFiles )
    return series( ...tasks )

}

async function parallelizeTasksFrom( taskFiles = [] ) {

    const tasks = await getTasksFrom( taskFiles )
    return parallel( ...tasks )

}

/// Task configuration management

function getTaskConfigurationPathFor( filename ) {

    // Get relative path of the task between internal or user defined
    let relativeTaskPath = filename.includes( iteePackageSourcesDirectory )
                           ? relative( iteePackageSourcesDirectory, filename )
                           : relative( packageTasksDirectory, filename )

    // Generate all possible config file path depending on file extension and default or user defined
    const terminalExtension = extname( relativeTaskPath )
    const searchValue       = relativeTaskPath.includes( '.task.' ) ? `.task${ terminalExtension }` : terminalExtension
    const replaceValues     = [
        '.conf.json',
        '.conf.js',
        '.conf.cjs',
        '.conf.mjs',
    ]

    const packageConfigurationPaths = []
    const defaultConfigurationPaths = []

    for ( const replaceValue of replaceValues ) {
        const configurationLocation    = relativeTaskPath.replace( searchValue, replaceValue )
        const packageConfigurationPath = join( packageTasksConfigurationsDirectory, configurationLocation )
        const defaultConfigurationPath = join( iteePackageSourcesDirectory, configurationLocation )

        packageConfigurationPaths.push( packageConfigurationPath )
        defaultConfigurationPaths.push( defaultConfigurationPath )
    }

    // Take care of the configuration search order (package first then default !)
    const configurationPaths = [ ...packageConfigurationPaths, ...defaultConfigurationPaths ]
    let configurationPath    = undefined

    // Looking for existing configuration file
    for ( const packageConfigurationPath of configurationPaths ) {

        if ( existsSync( packageConfigurationPath ) ) {
            configurationPath = packageConfigurationPath
            break
        }

    }

    // Else throw an error
    if ( !configurationPath ) {
        throw new Error( `Unable to find configuration in package configuration paths ${ configurationPaths.join( ', ' ) }.` )
    }

    return configurationPath

}

async function getTaskConfigurationFor( filename ) {

    const configurationFilePath = getTaskConfigurationPathFor( filename )

    log( `Loading configuration from ${ cyan( configurationFilePath ) }` )

    let configuration = null

    try {

        if ( extname( configurationFilePath ) === '.json' ) {

            configuration = getJsonFrom( configurationFilePath )

        } else {

            const moduleData = await import( configurationFilePath )
            configuration    = moduleData.default

        }

    } catch ( e ) {

        log( red( e ) )

    }

    return configuration

}


export {
    getTasksFrom,
    serializeTasksFrom,
    parallelizeTasksFrom,

    getTaskConfigurationPathFor,
    getTaskConfigurationFor,
}