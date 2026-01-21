import { glob }                    from 'glob'
import {
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync
}                                  from 'node:fs'
import {
    basename,
    extname,
    join,
    normalize
}                                  from 'node:path'
import { green }                   from './colors.mjs'
import { log }                     from './loggings.mjs'
import { packageSourcesDirectory } from './packages.mjs'

function createDirectoryIfNotExist( directoryPath ) {

    if ( existsSync( directoryPath ) ) { return }

    log( 'Creating', green( directoryPath ) )
    mkdirSync( directoryPath, { recursive: true } )

}

function getJsonFrom( path ) {

    const buffer      = readFileSync( path )
    const fileContent = buffer.toString()
    return JSON.parse( fileContent )

}

function createFile( filePath, fileContent ) {

    log( 'Creating', green( filePath ) )
    writeFileSync( filePath, fileContent )

}

function getFilesFrom( globPattern, filter = ( /*any*/ ) => true ) {

    return glob.sync( globPattern )
               .map( filePath => normalize( filePath ) )
               .filter( filter )

}

function getJavascriptSourceFiles( filePathsToIgnore = [] ) {

    return glob.sync( join( packageSourcesDirectory, '**' ) )
               .map( filePath => normalize( filePath ) )
               .filter( filePath => {
                   const fileName         = basename( filePath )
                   const isJsFile         = [ '.js', '.mjs', '.cjs' ].includes( extname( fileName ) )
                   const isNotPrivateFile = !fileName.startsWith( '_' )
                   const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                   return isJsFile && isNotPrivateFile && isNotIgnoredFile
               } )

}

export {
    createDirectoryIfNotExist,
    getJsonFrom,
    createFile,
    getFilesFrom,
    getJavascriptSourceFiles
}