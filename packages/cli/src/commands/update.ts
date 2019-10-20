import cli from 'cli-ux'

import {BaseCommand} from '@cli/BaseCommand'

export default class Update extends BaseCommand {
    public static description = 'Update data.';

    public static flags = {...BaseCommand.flags}

    public async run (): Promise<void> {
        cli.action.start('Updating')
        await this.client.update()
        cli.action.stop()
    }
}
