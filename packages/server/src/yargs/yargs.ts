import Yargs, {Argv} from 'yargs'

import {cli_options, CliOptions} from './options'

// @ts-ignore
export const yargs: Argv<CliOptions> = Yargs
    .scriptName('di')
    .env('DI_')
    .options(cli_options)
    .check(function (argv) {
        if (!argv.username && !argv.listenkey) {
            throw new Error('Either "username" and "password" or "listenkey" is required')
        }

        return true
    })
    .strict()
