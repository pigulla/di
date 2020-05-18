import JSONs from 'json-strictify'

import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

export default class StopCommand extends BaseCommand {
    public static description = 'Stop playback.'

    public static examples = ['$ di stop']

    public static flags = {...BaseCommand.flags}

    @HandleClientError()
    public async run(): Promise<void> {
        await this.client.stop_playback()
        this.print_formatted()
    }

    protected print_text(): void {
        // no output
    }

    protected print_json(): void {
        this.log(JSONs.stringify({}))
    }
}
