import { unstyle } from './colors.mjs'

/**
 *
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function alignTextCenter( text, width ) {

    const unstyledText = unstyle( text.repeat( 1 ) )
    const marginLength = ( width - unstyledText.length ) / 2

    let leftMargin, rightMargin
    if ( Number.isInteger( marginLength ) ) {
        leftMargin  = marginLength
        rightMargin = marginLength
    } else {
        const flooredMargin = Math.floor( marginLength )
        leftMargin          = flooredMargin
        rightMargin         = flooredMargin + 1
    }

    return ' '.repeat( leftMargin ) + text + ' '.repeat( rightMargin )

}

/**
 *
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function alignTextLeft( text, width ) {

    const unstyledText = unstyle( text.repeat( 1 ) )
    let repeatTime     = width - unstyledText.length
    repeatTime         = ( repeatTime > 0 ) ? repeatTime : 0

    return text + ' '.repeat( repeatTime )

}

/**
 *
 * @param {string} text
 * @param {number} width
 * @returns {string}
 */
function alignTextRight( text, width ) {

    const unstyledText = unstyle( text.repeat( 1 ) )
    let repeatTime     = width - unstyledText.length
    repeatTime         = ( repeatTime > 0 ) ? repeatTime : 0

    return ' '.repeat( repeatTime ) + text

}

function IndenterFactory( indentationChar = '\t', indentationLevel = 5 ) {

    const indentationLevels = {}
    let currentProperty     = 'I_'
    for ( let currentIndentationLevel = 1 ; currentIndentationLevel <= indentationLevel ; currentIndentationLevel++ ) {
        indentationLevels[ currentProperty ] = indentationChar.repeat( currentIndentationLevel )
        currentProperty += '_'
    }

    return {
        I: new Indenter( indentationChar ),
        ...indentationLevels
    }

}

/**
 * @param {string} string
 * @returns {string}
 */
function toCamelCase( string ) {

    if(typeof string !== 'string') throw new TypeError(`Invalid type '${typeof string}' expect string.`)

    return string
        .trim()
        .toLowerCase()
        .replace( /[^a-zA-Z0-9]+(.)/g, ( _, char ) => char.toUpperCase() )
        .replace( /^[A-Z]/, ( char ) => char.toLowerCase() )

}

class Indenter {

    constructor( indentationChar = '\t' ) {

        this.indentationChar         = indentationChar
        this.currentIndentationLevel = 0

    }

    _( indentationLevel = null ) {
        return this.indentationChar.repeat( indentationLevel ?? this.currentIndentationLevel )
    }

    deeper( level = 1 ) {
        this.currentIndentationLevel += level
    }

    shallower( level = 1 ) {
        this.currentIndentationLevel -= level
    }

}


export {
    alignTextCenter,
    alignTextLeft,
    alignTextRight,
    toCamelCase,
    IndenterFactory as Indenter
}