import js      from '@eslint/js'
import mocha   from 'eslint-plugin-mocha'
import {
    defineConfig,
    globalIgnores
}              from 'eslint/config'
import globals from 'globals'

class RulesSet {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                name:            '',
                files:           [],
                ignores:         [],
                plugins:         {},
                extends:         [],
                rules:           {},
                languageOptions: {},
            },
            ...parameters
        }

        this.name            = _parameters.name
        this.files           = _parameters.files
        this.ignores         = _parameters.ignores
        this.plugins         = _parameters.plugins
        this.extends         = _parameters.extends
        this.rules           = _parameters.rules
        this.languageOptions = _parameters.languageOptions

    }

    getConfig() {

        return {
            name:            this.name,
            files:           this.files,
            ignores:         this.ignores,
            plugins:         this.plugins,
            extends:         this.extends,
            rules:           this.rules,
            languageOptions: this.languageOptions
        }

    }

}

const sourceRulesSet = new RulesSet( {
    name:    'sources',
    files:   [
        'sources/**/*.js',
        'sources/**/*.cjs',
        'sources/**/*.mjs',
    ],
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
} )

const sourceCommonRulesSet = new RulesSet( {
    name:    'sources/common',
    files:   [
        'sources/common/**/*.js',
        'sources/common/**/*.cjs',
        'sources/common/**/*.mjs',
    ],
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
} )

const sourceFrontendRulesSet = new RulesSet( {
    name:            'sources/frontend',
    files:           [
        'sources/frontend/**/*.js',
        'sources/frontend/**/*.mjs',
    ],
    ignores:         [],
    plugins:         { js },
    extends:         [ 'js/recommended' ],
    languageOptions: { globals: globals.browser }
} )

const sourceBackendRulesSet = new RulesSet( {
    name:            'sources/backend',
    files:           [
        'sources/frontend/**/*.js',
        'sources/frontend/**/*.cjs',
        'sources/frontend/**/*.mjs',
    ],
    ignores:         [],
    plugins:         { js },
    extends:         [ 'js/recommended' ],
    languageOptions: { globals: globals.node }
} )

const testBenchmarksRulesSet = new RulesSet( {
    name:            'tests/benchmarks',
    files:           [
        'tests/benchmarks/**/*.js',
        'tests/benchmarks/**/*.cjs',
        'tests/benchmarks/**/*.mjs',
    ],
    ignores:         [],
    plugins:         { js },
    extends:         [ 'js/recommended' ],
    languageOptions: {
        globals: {
            Benchmark: 'readonly'
        },
    }
} )

const testUnitsRulesSet = new RulesSet( {
    name:            'tests/units',
    files:           [
        'tests/units/**/*.js',
        'tests/units/**/*.cjs',
        'tests/units/**/*.mjs',
    ],
    ignores:         [],
    plugins:         { js },
    extends:         [ 'js/recommended' ],
    languageOptions: {
        globals: {
            describe: 'readonly',
            it:       'readonly',
        },
    }
} )

const mochaRecommendedRulesSet = new RulesSet( {
    files:   [
        'tests/units/**/*.js',
        'tests/units/**/*.cjs',
        'tests/units/**/*.mjs',
    ],
    ignores: [],
    ...mocha.configs.recommended,
} )

class Configurator {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                globalIgnores: [],
                linterOptions: {},
                rulesSets:     []
            },
            ...parameters
        }

        this.globalIgnores = _parameters.globalIgnores
        this.linterOptions = _parameters.linterOptions
        this.rulesSets     = _parameters.rulesSets

    }

    getConfig() {

        const rulesSets = this.rulesSets.map( rulesSet => rulesSet.getConfig() )

        return defineConfig( [
            globalIgnores( this.globalIgnores ),
            {
                linterOptions: this.linterOptions
            },
            ...rulesSets
        ] )

    }

}

const defaultConfigurator = new Configurator( {
    globalIgnores: [
        '.github',
        '.idea',
        '.reports',
        'builds',
        'docs',
        'node_modules',
    ],
    linterOptions: {
        noInlineConfig:                false,
        reportUnusedDisableDirectives: 'error',
        reportUnusedInlineConfigs:     'error'
    },
    rulesSets:     [
        sourceRulesSet,
        testBenchmarksRulesSet,
        testUnitsRulesSet,
        mochaRecommendedRulesSet
    ]
} )

const defaultConfiguration = defaultConfigurator.getConfig()

export {
    defaultConfiguration as default,
    defaultConfigurator as Configurator,
    sourceRulesSet as SourceRulesSet,
    sourceCommonRulesSet as SourceCommonRulesSet,
    sourceFrontendRulesSet as SourceFrontendRulesSet,
    sourceBackendRulesSet as SourceBackendRulesSet,
    testBenchmarksRulesSet as TestBenchmarksRulesSet,
    testUnitsRulesSet as TestUnitsRulesSet,
    mochaRecommendedRulesSet as MochaRecommendedRulesSet,
    RulesSet
}
