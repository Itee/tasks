import colors from 'ansi-colors'

const red     = ( value ) => colors.red( value )
const green   = ( value ) => colors.green( value )
const blue    = ( value ) => colors.blue( value )
const cyan    = ( value ) => colors.cyan( value )
const yellow  = ( value ) => colors.yellow( value )
const magenta = ( value ) => colors.magenta( value )
const unstyle = ( value ) => colors.unstyle( value )

export {
    red,
    green,
    blue,
    cyan,
    yellow,
    magenta,
    unstyle
}