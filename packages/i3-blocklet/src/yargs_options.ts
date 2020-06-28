import {Options} from 'yargs'

const allowed_protocols = new Set(['https:', 'http:'])

export const yargs_options: Record<string, Options> = {
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

            if (!allowed_protocols.has(url.protocol)) {
                throw new Error('Endpoint must be http or https')
            }

            return url.toString()
        },
    },
}
