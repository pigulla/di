/* eslint-disable no-console */
/* istanbul ignore file */
import {notifier} from './notifier'

notifier(process.argv)
    .catch(function (error) {
        process.exitCode = 2
        console.error(error)
    })
