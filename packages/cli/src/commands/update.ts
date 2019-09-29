import cli from 'cli-ux';

import {BaseCommand} from '../BaseCommand';

export default class Update extends BaseCommand {
    static description = 'Update data.';

    static flags = {...BaseCommand.flags}

    async run (): Promise<void> {
        cli.action.start('Updating');
        await this.axios({
            method: 'PUT',
            url: '/server/update',
        });
        cli.action.stop();
    }
}
