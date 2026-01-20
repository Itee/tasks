import nodeResolve     from '@rollup/plugin-node-resolve'
import colors          from 'ansi-colors'
import log             from 'fancy-log'
import cleanup         from 'rollup-plugin-cleanup'
import { packageName } from '../../index.mjs'

const { red } = colors

export default {
    ignoredFiles: [
        `${ packageName }.js`
    ],
    buildOptions: {
        input:   null,
        plugins: [
            nodeResolve(),
            cleanup( {
                comments: 'all' // else remove __PURE__ declaration... -_-'
            } )
        ],
        onwarn: ( {
            loc,
            frame,
            message
        } ) => {

            // Ignore some errors
            if ( message.includes( 'Circular dependency' ) ) { return }
            if ( message.includes( 'Generated an empty chunk' ) ) { return }

            let errorMessage = ( loc )
                               ? `/!\\ ${ loc.file } (${ loc.line }:${ loc.column }) ${ frame } ${ message }\n`
                               : `/!\\ ${ message }\n`

            log( red( errorMessage ) )

        },
        treeshake: {
            moduleSideEffects:                true,
            annotations:                      true,
            correctVarValueBeforeDeclaration: true,
            propertyReadSideEffects:          true,
            tryCatchDeoptimization:           true,
            unknownGlobalSideEffects:         true
        },
        output: {
            indent: '\t',
            format: 'esm',
            file:   null
        }
    }
}
