import {BaseCommand} from '@cli/BaseCommand'

export default class Status extends BaseCommand {
    public static description = 'Test if the server is alive.';

    public static flags = {...BaseCommand.flags}

    public async run (): Promise<void> {
        const is_running = await this.client.is_alive()

        if (is_running) {
            this.log('Server running')
        } else {
            this.log('Server not available')
            this.exit(2)
        }
    }
}
