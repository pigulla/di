/* eslint-disable no-console */
/* istanbul ignore file */
import {cli} from './cli'

cli(process.argv)
    .then(result => JSON.stringify(result, null, 4))
    .then(console.log)
    .catch(function (error) {
        process.exitCode = 2
        console.error(error)
    })
