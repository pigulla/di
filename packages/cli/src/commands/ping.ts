import BaseCommand from '../base'
import handle_client_errors from '../handle_client_error'

export default class PingCommand extends BaseCommand {
    public static description = 'Test if the server is alive.'

    public static flags = {...BaseCommand.flags}

    public async run (): Promise<void> {
        try {
            const is_running = await this.client.is_alive()
            if (is_running) {
                this.log('Server is alive')
            } else {
                this.log('Server unavailable')
            }
        } catch (error) {
            handle_client_errors(error)
        }
    }
}
