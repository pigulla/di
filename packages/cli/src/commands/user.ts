import JSONs from 'json-strictify';

import {BaseCommand} from '../BaseCommand';

export default class User extends BaseCommand {
    static description = 'Get user info.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        const user = await this.client.get_user();

        this.log(JSONs.stringify(user));
    }
}
