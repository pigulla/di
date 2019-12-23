import BaseCommand from '../base'
import handle_client_error from '../handle_client_error'

export default class StopCommand extends BaseCommand {
    public static description = 'Stop blayback.'

    public static flags = {...BaseCommand.flags}

    public async run (): Promise<void> {
        try {
            await this.client.stop_playback()
        } catch (error) {
            handle_client_error(error)
        }
    }
}
