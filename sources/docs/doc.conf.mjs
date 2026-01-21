import {
    getPrettyPackageName,
    getPrettyPackageVersion,
    packageAuthor
} from '../utils/packages.mjs'

export default {
    tags: {
        allowUnknownTags: false,
        dictionaries:     [
            'jsdoc',
            'closure'
        ]
    },
    source: {
        include: [
            'README.md',
            'gulpfile.mjs',
            './sources'
        ],
        includePattern: '.+\\.(js|mjs|jsx)?$',
        excludePattern: '(node_modules|docs|builds)',
        exclude:        []
    },
    sourceType:   'module',
    plugins:      [],
    recurseDepth: 5,
    opts:         {
        template:    './node_modules/ink-docstrap/template',
        access:      'all',
        debug:       false,
        encoding:    'utf8',
        destination: 'docs',
        recurse:     true,
        verbose:     true,
        private:     true
    },
    templates: {
        cleverLinks:       false,
        monospaceLinks:    false,
        navType:           'inline',
        theme:             'cyborg',
        syntaxTheme:       'dark',
        linenums:          true,
        collapseSymbols:   false,
        sort:              'longname, version, since',
        search:            true,
        systemName:        `${ getPrettyPackageName() } ${ getPrettyPackageVersion() }`,
        footer:            '',
        copyright:         `Copyright 2015-Present <a href="${packageAuthor.url}">${packageAuthor.name}</a>`,
        includeDate:       false,
        inverseNav:        false,
        outputSourceFiles: true,
        outputSourcePath:  true
    }
}