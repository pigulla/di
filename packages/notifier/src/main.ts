/* eslint-disable no-console */
/* istanbul ignore file */
import {change_notifier} from './change_notifier'

change_notifier(process.argv)
    .catch(function (error) {
        process.exitCode = 2
        console.error(error)
    })
