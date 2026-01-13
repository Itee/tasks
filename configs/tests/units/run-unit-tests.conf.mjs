import { join }                        from 'path'
import { iteePackageSourcesDirectory } from '../../../sources/_utils.mjs'

export default [
    join( iteePackageSourcesDirectory, 'tests/units/run-unit-tests-for-backend.task.mjs' ),
    join( iteePackageSourcesDirectory, 'tests/units/run-unit-tests-for-frontend.task.mjs' )
]
