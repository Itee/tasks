import js    from '@eslint/js'
import mocha from 'eslint-plugin-mocha'
import {
    defineConfig,
    globalIgnores
}            from 'eslint/config'

export default defineConfig( [
    globalIgnores( [
        '.github',
        '.idea',
        'builds',
        'docs'
    ] ),
    {
        linterOptions: {
            noInlineConfig:                false,
            reportUnusedDisableDirectives: 'error',
            reportUnusedInlineConfigs:     'error'
        }
    },
    {
        name:    'sources',
        files:   [ 'sources/**/*.js' ],
        ignores: [],
        plugins: { js },
        extends: [ 'js/recommended' ],
        rules:   {
            'no-multiple-empty-lines':  [
                'error',
                {
                    'max': 2
                }
            ],
            'no-mixed-spaces-and-tabs': 'error',
            'no-console':               'warn',
            'no-unused-vars':           'error',
            'no-multi-spaces':          [
                'error',
                {
                    'exceptions': {
                        'Property':             true,
                        'ImportDeclaration':    true,
                        'VariableDeclarator':   true,
                        'AssignmentExpression': true
                    }
                }
            ],
            'key-spacing':              [
                'error',
                {
                    'align': {
                        'beforeColon': false,
                        'afterColon':  true,
                        'on':          'value'
                    }
                }
            ]
        }
    },
    {
        name:            'tests/benchmarks',
        files:           [ 'tests/benchmarks/**/*.js' ],
        ignores:         [ 'tests/benchmarks/builds/*' ],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: {
            globals: {
                Benchmark: 'readonly'
            },
        }
    },
    {
        name:            'tests/units',
        files:           [ 'tests/units/**/*.mjs' ],
        ignores:         [ 'tests/units/builds/*' ],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it:       'readonly',
            },
        }
    },
    {
        files:   [ 'tests/units/**/*.mjs' ],
        ignores: [ 'tests/units/builds/*' ],
        ...mocha.configs.recommended,
    }
] )
