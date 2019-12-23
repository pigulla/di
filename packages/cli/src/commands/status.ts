import BaseCommand from '../base'
import handle_client_error from '../handle_client_error'

export default class StatusCommand extends BaseCommand {
    public static description = 'Show the current playback status.'

    public static flags = {...BaseCommand.flags}

    public async run (): Promise<void> {
        try {
            const playback_state = await this.client.get_playback_state()

            if (playback_state) {
                const {artist, title} = playback_state.now_playing
                const {name} = playback_state.channel
                this.log(`Now playing channel ${name}: ${artist} - ${title}`)
            } else {
                this.log('Playback is paused')
            }
        } catch (error) {
            handle_client_error(error)
        }
    }
}
