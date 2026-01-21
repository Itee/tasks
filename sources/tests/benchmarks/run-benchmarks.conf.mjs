import { join }                        from 'node:path'
import { iteePackageSourcesDirectory } from '../../utils/packages.mjs'

export default [
    join( iteePackageSourcesDirectory, 'tests/benchmarks/run-benchmarks-for-backend.task.mjs' ),
    join( iteePackageSourcesDirectory, 'tests/benchmarks/run-benchmarks-for-frontend.task.mjs' )
]
