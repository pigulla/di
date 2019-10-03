import {Command, flags} from '@oclif/command';
import {Client} from '@digitally-imported/client';

export abstract class BaseCommand extends Command {
    protected client_instance: Client|null = null;

    public static flags = {
        endpoint: flags.string({
            char: 'e',
            description: 'The endpoint where the server is listening',
            env: 'DI_ENDPOINT',
            default: 'http://localhost:4979',
        }),
    }

    protected get client (): Client {
        const {flags} = this.parse(BaseCommand);

        if (!this.client_instance) {
            this.client_instance = new Client({
                endpoint: flags.endpoint,
            });
        }

        return this.client_instance;
    }
}
