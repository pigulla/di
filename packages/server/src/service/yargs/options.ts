import {existsSync as exists} from 'fs'

import {sync as which} from 'which'
import {Options} from 'yargs'
import {LogLevel} from '@nestjs/common'

export interface CliOptions {
    // Server
    hostname: string
    port: number
    logLevel: LogLevel

    // VLC
    vlcPath: string
    vlcTimeout: number
    vlcInitialVolume: number

    // Digitally Imported
    url: string
    username?: string
    password?: string
    listenkey?: string
}

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
        alias: 'o',
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
        default: function auto () {
            try {
                const path = which('vlc')
                return path
            } catch (e) {
                return undefined
            }
        },
        normalize: true,
        type: 'string',
        coerce (arg: any): string {
            if (arg === '') {
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
        alias: 'b',
        requiresArg: true,
        default: 'https://www.di.fm',
        describe: 'The base url for Digitally Imported',
        hidden: true,
        type: 'string',
    },
    username: {
        group: 'Digitally Imported',
        alias: 'u',
        requiresArg: true,
        describe: 'The username of your account (usually your email-address)',
        type: 'string',
        conflicts: ['listenkey'],
        implies: ['password'],
    },
    password: {
        group: 'Digitally Imported',
        alias: 'p',
        requiresArg: true,
        describe: 'The password of your account',
        type: 'string',
        conflicts: ['listenkey'],
        implies: ['username'],
    },
    listenkey: {
        group: 'Digitally Imported',
        alias: 'k',
        requiresArg: true,
        describe: 'The DI listenkey',
        type: 'string',
        conflicts: ['username', 'password'],
        coerce (arg: any): boolean {
            if (/^[a-f0-9]{16}$/i.test(arg)) {
                throw new Error('Listenkey must be a 16 characters long hexadecimal string')
            }

            return arg
        },
    },
}

export const cli_options: {[key: string]: Options} = {
    ...server_options,
    ...vlc_options,
    ...di_options,
}
