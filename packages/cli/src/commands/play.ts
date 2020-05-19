import JSONs from 'json-strictify'

import {ChannelDTO, OnAirDTO} from '@digitally-imported/dto'

import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

export default class PlayCommand extends BaseCommand<[OnAirDTO, ChannelDTO]> {
    public static description = 'Play a channel.'

    public static examples = ['$ di play progressive']

    public static flags = {...BaseCommand.flags}

    public static args = [
        {
            name: 'channel',
            required: true,
            description: 'The name of the channel to play.',
        },
    ]

    @HandleClientError()
    public async run(): Promise<void> {
        const {args} = this.parse(PlayCommand)

        const channel = await this.client.start_playback(args.channel)
        const on_air = await this.client.get_on_air(channel.key)

        this.print_formatted(on_air, channel)
    }

    protected print_text(on_air: OnAirDTO, channel: ChannelDTO): void {
        const {title, artist} = on_air
        const {name} = channel

        this.log(`Now playing channel ${name}: ${artist} - ${title}`)
    }

    protected print_json(on_air: OnAirDTO, channel: ChannelDTO): void {
        this.log(JSONs.stringify({on_air, channel}))
    }
}
