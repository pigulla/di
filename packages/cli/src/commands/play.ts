import BaseCommand from '../base'
import handle_client_error from '../handle_client_error'

export default class PlayCommand extends BaseCommand {
    public static description = 'Play a channel.'

    public static flags = {...BaseCommand.flags}

    public static args = [
        {
            name: 'channel',
            required: true,
            description: 'The name of the channel to play.',
        },
    ]

    public async run (): Promise<void> {
        const {args} = this.parse(PlayCommand)

        try {
            await this.client.start_playback(args.channel)
        } catch (error) {
            handle_client_error(error)
        }
    }
}
