import {BaseCommand} from '@cli/BaseCommand'

export default class Stop extends BaseCommand {
    public static description = 'Stop playback.';

    public static flags = {...BaseCommand.flags}

    public async run (): Promise<void> {
        await this.client.stop_playback()
    }
}
