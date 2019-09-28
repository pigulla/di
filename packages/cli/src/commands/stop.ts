import {BaseCommand} from '../BaseCommand';

export default class Stop extends BaseCommand {
    static description = 'Stop playback.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        await this.axios({
            method: 'DELETE',
            url: '/playback',
        });
    }
}
