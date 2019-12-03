import {BaseCommand} from '../BaseCommand'

export default class Play extends BaseCommand {
    public static description = 'Play a channel.';

    public static flags = {...BaseCommand.flags}

    public static args = [
        {
            name: 'channel',
            required: true,
            description: 'The name of the channel to play.',
        },
    ]

    public async run (): Promise<void> {
        const {args} = this.parse(Play)

        await this.client.start_playback(args.channel)
    }
}
