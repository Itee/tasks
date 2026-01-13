import { join }                        from 'path'
import { iteePackageSourcesDirectory } from '../../../sources/_utils.mjs'

export default [
    join( iteePackageSourcesDirectory, 'tests/benchmarks/run-benchmarks-for-backend.task.mjs' ),
    join( iteePackageSourcesDirectory, 'tests/benchmarks/run-benchmarks-for-frontend.task.mjs' )
]
