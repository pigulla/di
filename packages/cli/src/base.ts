import {Command, flags} from '@oclif/command'
import {CLIError} from '@oclif/errors'
import {Input} from '@oclif/command/lib/flags'

import {Client} from '@digitally-imported/client'

export enum OutputFormat {
    TEXT = 'text',
    JSON = 'json',
}

export default abstract class BaseCommand<T extends any[] = []> extends Command {
    private client_instance: Client|null = null

    public static flags = {
        endpoint: flags.string({
            char: 'e',
            description: 'The endpoint where the server is listening',
            env: 'DI_ENDPOINT',
            default: 'http://localhost:4979',
        }),
        'skip-version-check': flags.boolean({
            char: 's',
            description: 'Do not check whether the client and server versions match',
            env: 'DI_SKIP_VERSION_CHECK',
            default: false,
        }),
        'output-format': flags.enum({
            char: 'o',
            description: 'The output format',
            options: Object.values(OutputFormat),
            required: false,
            default: OutputFormat.TEXT,
            env: 'DI_OUTPUT_FORMAT',
        }),
    }

    protected async init (): Promise<void> {
        if (this.client_instance) {
            return
        }

        const {flags} = this.parse(this.constructor as any as Input<any>)
        // TODO: remove ts-ignore
        this.client_instance = new Client({
            // @ts-ignore
            endpoint: flags.endpoint,
            // @ts-ignore
            check_version: !flags['skip-version-check'],
            user_agent: this.config.userAgent,
        })
    }

    protected get client (): Client {
        if (!this.client_instance) {
            throw new Error('Command not initialized')
        }

        return this.client_instance
    }

    protected abstract print_text (...value: T): void
    protected abstract print_json (...value: T): void

    protected print_formatted (...value: T): void {
        const {flags} = this.parse(this.constructor as any as Input<any>)

        // @ts-ignore
        switch (flags['output-format']) {
            case OutputFormat.TEXT:
                return this.print_text(...value)
            case OutputFormat.JSON:
                return this.print_json(...value)
            default:
                throw new CLIError('Unexpected format')
        }
    }
}
