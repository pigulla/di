import JSONs from 'json-strictify';

import {BaseCommand} from '../BaseCommand';

export default class Status extends BaseCommand {
    static description = 'Get server status.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        const state = await this.client.get_playback_state();

        this.log(JSONs.stringify(state));
    }
}
