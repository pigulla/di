import {BaseCommand} from '../BaseCommand';

export default class Status extends BaseCommand {
    static description = 'Test if the server is alive.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        try {
            const response = await this.axios({method: 'HEAD', url: '/server'});
            this.log(`Server is alive (${response.headers['x-app-version']})`);
        } catch (error) {
            if (error.isAxiosError && error.code === 'ECONNREFUSED') {
                this.log('Server is not running');
                return this.exit(2);
            }

            throw error;
        }
    }
}
