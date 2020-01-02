import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

import {PlaybackStateDTO} from '@digitally-imported/dto'
import JSONs from 'json-strictify'

export default class StatusCommand extends BaseCommand<[PlaybackStateDTO|null]> {
    public static description = 'Show the current playback status.'

    public static examples = [
        '$ di status',
    ]

    public static flags = {...BaseCommand.flags}

    @HandleClientError()
    public async run (): Promise<void> {
        const playback_state = await this.client.get_playback_state()

        this.print_formatted(playback_state)
    }

    protected print_text (playback_state: PlaybackStateDTO|null): void {
        if (playback_state) {
            const {artist, title} = playback_state.now_playing
            const {name} = playback_state.channel

            this.log(`Now playing channel ${name}: ${artist} - ${title}`)
        } else {
            this.log('Playback is paused')
        }
    }

    protected print_json (playback_state: PlaybackStateDTO|null): void {
        this.log(JSONs.stringify(playback_state))
    }
}
