import Yargs, {Options} from 'yargs'

const cli_options: Record<string, Options> = {
    endpoint: {
        alias: 'e',
        requiresArg: true,
        default: 'http://localhost:4979',
        describe: 'The endpoint to connect to.',
        type: 'string',
        coerce(input: string): string {
            let url: URL

            try {
                url = new URL(input)
            } catch (error) {
                throw new Error('Endpoint is not a valid URL')
            }
// console.log(url.protocol)
//             if (!['http', 'https'].includes(url.protocol)) {
//                 throw new Error('Endpoint must be http or https')
//             }

            return url.toString()
        },
    },
}

export const yargs = Yargs.scriptName('di-i3-blocklet').env('DI_').options(cli_options).help()
