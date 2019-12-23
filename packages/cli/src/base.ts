import {Command, flags} from '@oclif/command'
import {Input} from '@oclif/command/lib/flags'

import {Client} from '@digitally-imported/client'

export default abstract class BaseCommand extends Command {
    private client_instance: Client|null = null;

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
    }

    protected async init (): Promise<void> {
        const {flags} = this.parse(this.constructor as any as Input<any>)

        if (!this.client_instance) {
            this.client_instance = new Client({
                endpoint: flags.endpoint,
                check_version: !flags['skip-version-check'],
            })
        }
    }

    protected get client (): Client {
        if (!this.client_instance) {
            throw new Error('Command not initialized')
        }

        return this.client_instance
    }
}
