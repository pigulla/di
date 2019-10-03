import {BaseCommand} from '../BaseCommand';
import {ServerNotRunningError} from '@digitally-imported/client/lib/error';

export default class Status extends BaseCommand {
    static description = 'Test if the server is alive.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        try {
            const status = await this.client.get_server_status();
            this.log(`Server running (${status.server.version})`);
        } catch (error) {
            if (error instanceof ServerNotRunningError) {
                this.log('Server is not running');
                return this.exit(2);
            }

            throw error;
        }
    }
}
