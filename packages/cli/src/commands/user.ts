import {UserDTO} from '@digitally-imported/dto/lib';
import JSONs from 'json-strictify';

import {BaseCommand} from '../BaseCommand';

export default class User extends BaseCommand {
    static description = 'Get user info.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        const response = await this.axios({
            method: 'GET',
            url: '/user',
        });
        const user: UserDTO = response.data;

        this.log(JSONs.stringify(user));
    }
}
