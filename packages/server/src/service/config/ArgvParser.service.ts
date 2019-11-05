import {existsSync as exists} from 'fs'

import yargs, {Options} from 'yargs'

import {IArgvParser} from './ArgvParser.interface'
import {ApplicationOptions} from './ApplicationOptions'
import {Quality} from '../di'

interface ArgvParserOptions {
    skip_vlc_validation: boolean
    default_vlc_binary: string|null
    auto_exit: boolean
}

const default_parser_options: ArgvParserOptions = {
    skip_vlc_validation: false,
    default_vlc_binary: null,
    auto_exit: true,
}

export function create_argv_parser (options: Partial<ArgvParserOptions> = {}): IArgvParser {
    const {
        auto_exit,
        default_vlc_binary,
        skip_vlc_validation,
    } = Object.assign({}, default_parser_options, options)

    const server_options: {[key: string]: Options} = {
        hostname: {
            group: 'Server',
            alias: 'h',
            requiresArg: true,
            default: 'localhost',
            describe: 'The hostname to listen on',
            type: 'string',
        },
        port: {
            group: 'Server',
            alias: 'p',
            requiresArg: true,
            default: 4979,
            describe: 'The port to listen on',
            type: 'number',
            coerce (arg: any): number {
                if (!/^\d+$/.test(arg)) {
                    throw new Error('Port must be an integer')
                }

                const port = parseInt(arg, 10)

                if (port > 65535) {
                    throw new Error('Port must be below 65535')
                }

                return port
            },
        },
        'log-level': {
            group: 'Server',
            alias: 'l',
            requiresArg: true,
            choices: ['error', 'warn', 'log', 'debug', 'verbose'],
            default: 'log',
            type: 'string',
        },
    }

    const vlc_options: {[key: string]: Options} = {
        'vlc-path': {
            group: 'VLC',
            alias: 'v',
            requiresArg: true,
            default: default_vlc_binary,
            normalize: true,
            type: 'string',
            coerce (arg: any): string {
                if (skip_vlc_validation) {
                    return arg
                }

                if (!arg) {
                    throw new Error('VLC executable could not be auto detected. Please provide it explicitly.')
                } else if (!exists(arg)) {
                    throw new Error(`VLC executable not found at path ${arg}`)
                }

                return arg
            },
        },
        'vlc-timeout': {
            group: 'VLC',
            alias: 't',
            requiresArg: true,
            default: 1000,
            describe: 'The timeout in milliseconds when connecting to VLC',
            type: 'number',
            coerce (arg: any): number {
                if (!/^\d+$/.test(arg)) {
                    throw new Error('vlc-timeout must be an integer')
                }

                const port = parseInt(arg, 10)

                return port
            },
        },
        'vlc-initial-volume': {
            group: 'VLC',
            alias: 'i',
            requiresArg: true,
            default: 0.5,
            describe: 'The default volume to set after start',
            type: 'number',
            coerce (arg: any): number {
                if (!/^(\d+|\.\d+|\d+\.\d+)?$/.test(arg)) {
                    throw new Error('vlc-initial-volume must be a floating point number')
                }

                const volume = parseFloat(arg)

                if (volume > 1.25) {
                    throw new Error('vlc-initial-volume must be between 0 and 1.25')
                }

                return volume
            },
        },
    }

    const di_options: {[key: string]: Options} = {
        url: {
            group: 'Digitally Imported',
            alias: 'u',
            requiresArg: true,
            default: 'https://www.di.fm',
            describe: 'The base url for Digitally Imported',
            hidden: true,
            type: 'string',
        },
        frequency: {
            group: 'Digitally Imported',
            alias: 'f',
            requiresArg: true,
            default: 30,
            describe: 'The frequency in seconds with which DI is polled for "now playing" data',
            type: 'number',
            coerce (arg: any): number {
                if (!/^\d+$/.test(arg)) {
                    throw new Error('The frequency must be an integer')
                }

                return parseInt(arg, 10)
            },
        },
        quality: {
            group: 'Digitally Imported',
            alias: 'q',
            requiresArg: true,
            describe: 'The quality setting for the stream',
            default: Quality.AAC_128,
            type: 'string',
            choices: Object.values(Quality),
        },
        listenkey: {
            group: 'Digitally Imported',
            alias: 'k',
            required: true,
            requiresArg: true,
            describe: 'The DI listenkey',
            type: 'string',
            coerce (arg: any): boolean {
                if (!/^[a-f0-9]{16}$/i.test(arg)) {
                    throw new Error('Listenkey must be a 16 characters long hexadecimal string')
                }

                return arg
            },
        },
    }

    const cli_options: {[key: string]: Options} = {
        ...server_options,
        ...vlc_options,
        ...di_options,
    }

    return function argv_parser (argv: string[]): ApplicationOptions {
        return yargs
            .scriptName('di')
            .env('DI_')
            .options(cli_options)
            .strict()
            .exitProcess(auto_exit)
            .parse(argv) as any as ApplicationOptions
    }
}