import { jsonReporter }       from '@itee/json-reporter'
import { playwrightLauncher } from '@web/test-runner-playwright'

export default {
    files:          [
        'tests/benchmarks/**/*.bench.js'
    ],
    debug:          false,
    nodeResolve:    true,
    browsers:       [
        playwrightLauncher( { product: 'chromium' } ),
        playwrightLauncher( { product: 'webkit' } ),
        playwrightLauncher( { product: 'firefox' } ),
    ],
    testFramework:  {
        path:   'node_modules/@itee/benchmarks-framework/benchmarks-framework.js',
        config: {
            foo: 'bar'
        }
    },
    testRunnerHtml: testFramework => `
        <!DOCTYPE html>
        <html>
          <body>
            <script type="module" src="node_modules/lodash/lodash.js"></script>
            <script type="module" src="node_modules/platform/platform.js"></script>
            <script type="module" src="node_modules/benchmark/benchmark.js"></script>
            <script type="module" src="${ testFramework }"></script>
          </body>
        </html>
    `,
    reporters:      [
        jsonReporter( {
            reportProgress: true
        } )
    ]
}