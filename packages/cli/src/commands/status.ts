import {StateDTO} from '@digitally-imported/dto/lib';
import JSONs from 'json-strictify';

import {BaseCommand} from '../BaseCommand';

export default class Status extends BaseCommand {
    static description = 'Get server status.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        const response = await this.axios(
            {
                method: 'GET',
                url: '/server'
            }
        );
        const state: StateDTO = response.data;

        this.log(JSONs.stringify(state));
    }
}
