import commonjs    from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser      from '@rollup/plugin-terser'
import figlet      from 'figlet'
import {
    basename,
    join
}                  from 'node:path'
import replace     from 'rollup-plugin-re'
import { red }     from './colors.mjs'
import { log }     from './loggings.mjs'
import {
    getPrettyPackageName,
    getPrettyPackageVersion,
    getUnscopedPackageName,
    packageAuthor,
    packageBuildsDirectory,
    packageDescription,
    packageLicense,
    packageSourcesDirectory
}                  from './packages.mjs'


function getPrettyFormatForBanner( format ) {

    let prettyFormat = ''

    switch ( format ) {

        case 'cjs':
            prettyFormat = 'CommonJs'
            break

        case 'esm':
            prettyFormat = 'EsModule'
            break

        case 'iife':
            prettyFormat = 'Standalone'
            break

        case 'umd':
            prettyFormat = 'Universal'
            break

        default:
            throw new RangeError( `Invalid switch parameter: ${ format }` )

    }

    return prettyFormat

}

function convertBannerIntoComment( banner ) {

    let bannerCommented = '/**\n'
    bannerCommented += ' * '
    bannerCommented += banner.replaceAll( '\n', '\n * ' )
    bannerCommented += '\n'
    bannerCommented += ` * @desc    ${ packageDescription }\n`
    bannerCommented += ` * @author  [${ packageAuthor.name }]{@link ${ packageAuthor.url }}\n`
    bannerCommented += ` * @license [${ packageLicense }]{@link https://opensource.org/licenses}\n`
    bannerCommented += ' * \n'
    bannerCommented += ' */'

    return bannerCommented

}

function computeBannerFor( format ) {

    const packageName    = getPrettyPackageName( '.' )
    const packageVersion = getPrettyPackageVersion()
    const prettyFormat   = getPrettyFormatForBanner( format )

    const figText = figlet.textSync(
        `${ packageName } ${ packageVersion } - ${ prettyFormat }`,
        {
            font:             'Tmplr',
            horizontalLayout: 'default',
            verticalLayout:   'default',
            whitespaceBreak:  true,
        }
    )

    return convertBannerIntoComment( figText )

}

function computeIntroFor( requestPackages = [] ) {

    let intro = ''

    for ( const requestPackage of requestPackages ) {
        intro += `if( ${ requestPackage } === undefined ) { throw new Error('${ getPrettyPackageName() } need ${ requestPackage } to be defined first. Please check your scripts loading order.') }` + '\n'
    }

    return intro

}

function getOutputFileExtensionBasedOnFileFormat( format ) {

    let extension

    if ( format === 'cjs' ) {
        extension = 'cjs'
    } else if ( format === 'esm' ) {
        extension = 'mjs'
    } else {
        extension = 'js'
    }

    return extension

}

/**
 * Will create an appropriate configuration object for rollup, related to the given arguments.
 *
 * @generator
 * @param options
 * @return {Array.<json>} An array of rollup configuration
 */
function createRollupConfigs( options = {} ) {

    const _options = {
        input:     join( packageSourcesDirectory, `${ getUnscopedPackageName() }.js` ),
        output:    packageBuildsDirectory,
        formats:   [ 'esm', 'cjs', 'iife' ],
        envs:      [ 'dev', 'prod' ],
        treeshake: true,
        ...options
    }

    const {
              input,
              output,
              formats,
              envs,
              treeshake
          }        = _options
    const name     = getPrettyPackageName( '.' )
    const fileName = basename( input, '.js' )

    const configs = []

    for ( let formatIndex = 0, numberOfFormats = formats.length ; formatIndex < numberOfFormats ; ++formatIndex ) {

        for ( let envIndex = 0, numberOfEnvs = envs.length ; envIndex < numberOfEnvs ; envIndex++ ) {

            const env        = envs[ envIndex ]
            const isProd     = ( env.includes( 'prod' ) )
            const format     = formats[ formatIndex ]
            const extension  = getOutputFileExtensionBasedOnFileFormat( format )
            const outputPath = ( isProd )
                               ? join( output, `${ fileName }.min.${ extension }` )
                               : join( output, `${ fileName }.${ extension }` )

            configs.push( {
                input:    input,
                external: ( format === 'cjs' ) ? [
                    'fs'
                ] : [],
                plugins: [
                    replace( {
                        defines: {
                            IS_REMOVE_ON_BUILD:  false,
                            IS_BACKEND_SPECIFIC: ( format === 'cjs' )
                        }
                    } ),
                    commonjs( {
                        include: 'node_modules/**'
                    } ),
                    nodeResolve( {
                        preferBuiltins: true
                    } ),
                    isProd && terser()
                ],
                onwarn: ( {
                    loc,
                    frame,
                    message
                } ) => {

                    // Ignore some errors
                    if ( message.includes( 'Circular dependency' ) ) { return }
                    if ( message.includes( 'plugin uglify is deprecated' ) ) { return }

                    let errorMessage = ( loc )
                                       ? `/!\\ ${ loc.file } (${ loc.line }:${ loc.column }) ${ frame } ${ message }\n`
                                       : `/!\\ ${ message }\n`

                    log( red( errorMessage ) )

                },
                treeshake: treeshake,
                output:    {
                    // core options
                    file:    outputPath,
                    format:  format,
                    name:    name,
                    globals: {},

                    // advanced options
                    paths:     {},
                    banner:    ( isProd ) ? '' : computeBannerFor( format ),
                    footer:    '',
                    intro:     ( !isProd && format === 'iife' ) ? computeIntroFor() : '',
                    outro:     '',
                    sourcemap: !isProd,
                    interop:   'auto',

                    // danger zone
                    exports: 'auto',
                    amd:     {},
                    indent:  '\t',
                    strict:  true
                }
            } )

        }

    }

    return configs

}


export {
    getPrettyFormatForBanner,
    convertBannerIntoComment,
    computeBannerFor,
    computeIntroFor,
    createRollupConfigs,
}