import {Command, flags} from '@oclif/command'
import Parser from '@oclif/parser'
import {Client} from '@digitally-imported/client'

export abstract class BaseCommand extends Command {
    private client_instance: Client|null = null;

    public static flags = {
        endpoint: flags.string({
            char: 'e',
            description: 'The endpoint where the server is listening',
            env: 'DI_ENDPOINT',
            default: 'http://localhost:4979',
        }),
    }

    protected get client (): Client {
        const {flags} = this.parse(this.constructor as Parser.Input<any>)

        if (!this.client_instance) {
            this.client_instance = new Client({
                endpoint: flags.endpoint,
            })
        }

        return this.client_instance
    }
}
