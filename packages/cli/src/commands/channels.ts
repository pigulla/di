import {flags} from '@oclif/command'
import cli from 'cli-ux'
import JSONs from 'json-strictify'

import {ChannelDTO} from '@digitally-imported/dto'

import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

export default class ChannelsCommand extends BaseCommand<[ChannelDTO[]]> {
    public static description = 'List all available channels.'

    public static examples = ['$ di channels']

    public static flags = {
        ...BaseCommand.flags,
        'favorites-only': flags.boolean({
            char: 'f',
            description: 'List favorite channels only',
            default: false,
        }),
    }

    public static args = []

    @HandleClientError()
    public async run(): Promise<void> {
        const {flags} = this.parse(ChannelsCommand)
        const favorites_only = flags['favorites-only']

        return favorites_only ? this.print_favorites() : this.print_channels()
    }

    private async print_favorites(): Promise<void> {
        const favorites = await this.client.get_favorites()

        if (!favorites) {
            this.error('Favorites are not available')
        }

        this.print_formatted(favorites)
    }

    private async print_channels(): Promise<void> {
        const channels = await this.client.get_channels()

        this.print_formatted(channels)
    }

    protected print_text(channels: ChannelDTO[]): void {
        cli.table(
            channels.sort((a, b) => a.name.localeCompare(b.name)),
            {
                key: {},
                name: {},
                description: {},
            }
        )
    }

    protected print_json(channels: ChannelDTO[]): void {
        this.log(JSONs.stringify(channels))
    }
}
