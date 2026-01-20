import { playwrightLauncher } from '@web/test-runner-playwright'

export default {
    files:       [
        'tests/units/**/*.unit.mjs'
    ],
    debug:       false,
    nodeResolve: true,
    browsers:    [
        playwrightLauncher( { product: 'chromium' } ),
        playwrightLauncher( { product: 'webkit' } ),
        playwrightLauncher( { product: 'firefox' } ),
    ]
}