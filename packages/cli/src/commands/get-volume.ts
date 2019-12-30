import JSONs from 'json-strictify'

import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

export default class GetVolumeCommand extends BaseCommand<[number]> {
    public static description = 'Get the current playback volume.'

    public static flags = {...BaseCommand.flags}

    public static args = []

    @HandleClientError()
    public async run (): Promise<void> {
        const volume = await this.client.get_volume()

        this.print_formatted(volume)
    }

    protected print_text (volume: number): void {
        this.log(volume.toString())
    }

    protected print_json (volume: number): void {
        this.log(JSONs.stringify({volume}))
    }
}
