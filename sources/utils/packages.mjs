import childProcess      from 'child_process'
import {
    dirname,
    join
}                        from 'node:path'
import { fileURLToPath } from 'node:url'
import {
    red,
    yellow
}                        from './colors.mjs'
import { getJsonFrom }   from './files.mjs'
import { log }           from './loggings.mjs'

function _getPackageRootDirectory() {

    let __dirname

    if ( import.meta.dirname ) {
        __dirname = import.meta.dirname
    } else if ( import.meta.filename ) {
        __dirname = dirname( import.meta.filename )
    } else if ( import.meta.url ) {
        const __filename = fileURLToPath( import.meta.url )
        __dirname        = dirname( __filename )
    } else {
        throw new Error( 'Unable to retrieve module dirname.' )
    }

    return join( __dirname, '../../' )

}

const iteePackageRootDirectory        = _getPackageRootDirectory()
const iteePackageJsonPath             = join( iteePackageRootDirectory, 'package.json' )
const iteePackageNodeModulesDirectory = join( iteePackageRootDirectory, 'node_modules' )
const iteePackageSourcesDirectory     = join( iteePackageRootDirectory, 'sources' )

const packageRootDirectory                = iteePackageRootDirectory.includes( 'node_modules' ) ? join( iteePackageRootDirectory, '../../../' ) : iteePackageRootDirectory
const packageTasksDirectory               = join( packageRootDirectory, '.tasks' )
const packageTasksConfigurationsDirectory = join( packageTasksDirectory, 'configs' )
const packageNodeModulesDirectory         = join( packageRootDirectory, 'node_modules' )
const packageBuildsDirectory              = join( packageRootDirectory, 'builds' )
const packageSourcesDirectory             = join( packageRootDirectory, 'sources' )
const packageSourcesBackendDirectory      = join( packageSourcesDirectory, 'backend' )
const packageSourcesCommonDirectory       = join( packageSourcesDirectory, 'common' )
const packageSourcesFrontendDirectory     = join( packageSourcesDirectory, 'frontend' )
const packageTestsDirectory               = join( packageRootDirectory, 'tests' )
const packageTestsBenchmarksDirectory     = join( packageTestsDirectory, 'benchmarks' )
const packageTestsBundlesDirectory        = join( packageTestsDirectory, 'bundles' )
const packageTestsUnitsDirectory          = join( packageTestsDirectory, 'units' )
const packageDocsDirectory                = join( packageRootDirectory, 'docs' )
const packageTutorialsDirectory           = join( packageRootDirectory, 'tutorials' )
const packageJsonPath                     = join( packageRootDirectory, 'package.json' )

///

const packageJson        = getJsonFrom( packageJsonPath )
const packageName        = packageJson.name
const packageVersion     = packageJson.version
const packageDescription = packageJson.description
const packageAuthor      = packageJson.author
const packageLicense     = packageJson.license
const packageMain        = packageJson.main

function getUnscopedPackageName() {

    return packageName.startsWith( '@' )
           ? packageName.split( '/' )[ 1 ]
           : packageName.split( '-' )[ 1 ]

}

function getPrettyPackageName( separator = ' ' ) {

    let prettyPackageName = ''

    const nameSplits = packageName.startsWith( '@' )
                       ? packageName.slice( 1 ).split( '/' )
                       : packageName.split( '-' )

    for ( const nameSplit of nameSplits ) {
        prettyPackageName += nameSplit.charAt( 0 ).toUpperCase() + nameSplit.slice( 1 ) + separator
    }
    prettyPackageName = prettyPackageName.slice( 0, -1 )

    return prettyPackageName

}

function getPrettyPackageVersion() {

    return 'v' + packageVersion

}

function getPrettyNodeVersion() {

    let nodeVersion = 'vX.x.ₓ'

    try {
        nodeVersion = childProcess.execFileSync( 'node', [ '--version' ] )
                                  .toString()
                                  .replace( /(\r\n|\n|\r)/gm, '' )
    } catch ( e ) {
        log( red( e ) )

        if ( e.message.includes( 'ENOENT' ) ) {
            nodeVersion += yellow( ' Not seems to be accessible from the path environment.' )
        }
    }

    return ' node: ' + nodeVersion

}

function getPrettyNpmVersion() {

    let npmVersion = 'X.x.ₓ'

    try {
        npmVersion = childProcess.execFileSync( 'npm', [ '--version' ] )
                                 .toString()
                                 .replace( /(\r\n|\n|\r)/gm, '' )
    } catch ( e ) {
        log( red( e ) )

        if ( e.message.includes( 'ENOENT' ) ) {
            npmVersion += yellow( ' Not seems to be accessible from the path environment.' )
        }
    }

    return ' npm:  v' + npmVersion

}


export {
    iteePackageRootDirectory,
    iteePackageJsonPath,
    iteePackageNodeModulesDirectory,
    iteePackageSourcesDirectory,

    packageRootDirectory,
    packageTasksDirectory,
    packageTasksConfigurationsDirectory,
    packageNodeModulesDirectory,
    packageBuildsDirectory,
    packageSourcesDirectory,
    packageSourcesBackendDirectory,
    packageSourcesCommonDirectory,
    packageSourcesFrontendDirectory,
    packageTestsDirectory,
    packageTestsBenchmarksDirectory,
    packageTestsBundlesDirectory,
    packageTestsUnitsDirectory,
    packageDocsDirectory,
    packageTutorialsDirectory,
    packageJsonPath,

    packageJson,
    packageName,
    packageVersion,
    packageDescription,
    packageAuthor,
    packageLicense,
    packageMain,
    getUnscopedPackageName,
    getPrettyPackageName,
    getPrettyPackageVersion,
    getPrettyNodeVersion,
    getPrettyNpmVersion,
}