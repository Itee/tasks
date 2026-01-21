import { join }                        from 'node:path'
import { iteePackageSourcesDirectory } from '../../utils/packages.mjs'

export default [
    join( iteePackageSourcesDirectory, 'tests/units/run-unit-tests-for-backend.task.mjs' ),
    join( iteePackageSourcesDirectory, 'tests/units/run-unit-tests-for-frontend.task.mjs' )
]
