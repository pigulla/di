import Yargs from 'yargs'

export const yargs = Yargs.options({
    hostname: {
        alias: 'h',
        requiresArg: true,
        default: 'localhost',
        describe: 'The hostname to connect to',
        type: 'string',
    },
    port: {
        alias: 'p',
        requiresArg: true,
        default: 4979,
        describe: 'The port to connect on',
        type: 'number',
        coerce(arg: string): number {
            if (!/^\d+$/.test(arg)) {
                throw new Error('Port must be an integer')
            }

            const port = parseInt(arg, 10)

            if (port >= 65536) {
                throw new Error('Port must be below 65536')
            }

            return port
        },
    },
    https: {
        alias: 's',
        default: false,
        describe: 'Use https to connect',
        type: 'boolean',
    },
})
    .strict()
    .help()
