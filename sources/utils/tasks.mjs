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
    cyan,
    red,
}                      from './colors.mjs'
import { getJsonFrom } from './files.mjs'
import { log }         from './loggings.mjs'
import {
    iteePackageRootDirectory,
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

            for ( const moduleKey in module ) {
                const task = module[ moduleKey ]
                tasks.push( task )
            }

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
    let relativeTaskPath = filename.includes( iteePackageRootDirectory )
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

    // Generate all potential config file paths
    const configurationPaths = []
    for ( const replaceValue of replaceValues ) {
        const configurationLocation    = relativeTaskPath.replace( searchValue, replaceValue )
        const packageConfigurationPath = join( packageTasksConfigurationsDirectory, configurationLocation )

        configurationPaths.push( packageConfigurationPath )
    }

    // Take care of the configuration search order (package first then default !)
    const defaultConfigFilename = filename.includes( '.task.' )
                                  ? filename.replace( '.task.', '.conf.' )
                                  : filename.replace( '.mjs', '.conf.mjs' )

    configurationPaths.push( defaultConfigFilename )

    // Looking for existing configuration file
    let configurationPath = undefined
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