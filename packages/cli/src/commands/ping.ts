import {BaseCommand} from '../BaseCommand';

export default class Status extends BaseCommand {
    static description = 'Test if the server is alive.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        try {
            const response = await this._axios.head('/server');
            this.log(`Server is alive (${response.headers['x-app-version']})`);
        } catch (error) {
            if (!error.isAxiosError) {
                throw error;
            }

            this.error('Server is dead', {exit: 2});
        }
    }
}
