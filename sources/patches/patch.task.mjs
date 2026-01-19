import colors             from 'ansi-colors'
import {
    readFileSync,
    writeFileSync
}                         from 'node:fs'
import { basename }       from 'node:path'
import { logLoadingTask } from '../_utils.mjs'

logLoadingTask( import.meta.filename )

const {
          green,
          blue
      } = colors

/**
 * @method npm run patch
 * @global
 * @description Will apply some patch/replacements in dependencies
 */
const patchTask       = ( done ) => {

    // patch jsdoc
    {
        const jsdocFilePath      = 'node_modules/jsdoc/cli.js'
        const searchValue        = 'case \'.js\':'
        const replaceValue       = '' +
            'case \'.mjs\':' + '\n' +
            '\t\t\t\t\t' + 'config = require( path.resolve(confPath) ).default || {};' + '\n' +
            '\t\t\t\t\t' + 'break;' + '\n' +
            '\t\t\t\t' + 'case \'.js\':' + '\n' +
            '\t\t\t\t' + 'case \'.cjs\':'
        const fileContent        = readFileSync( jsdocFilePath ).toString()
        const patchedFileContent = fileContent.replace( searchValue, replaceValue )
        writeFileSync( jsdocFilePath, patchedFileContent )
    }

    done()
}
patchTask.displayName = basename( import.meta.filename, '.task.mjs' )
patchTask.description = 'Will apply some patch/replacements in dependencies'
patchTask.flags       = null

export { patchTask }