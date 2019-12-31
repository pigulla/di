import {ChannelDTO} from '@digitally-imported/dto'
import JSONs from 'json-strictify'
import cli from 'cli-ux'

import BaseCommand from '../base'
import {HandleClientError} from '../handle-client-error'

export default class FavoritesCommand extends BaseCommand<[ChannelDTO[]|null]> {
    public static description = 'List the favorite channels (if available).'

    public static flags = {...BaseCommand.flags}

    @HandleClientError()
    public async run (): Promise<void> {
        const favorites = await this.client.get_favorites()

        this.print_formatted(favorites)
    }

    protected print_text (favorites: ChannelDTO[]|null): void {
        if (favorites) {
            cli.table(
                favorites,
                {
                    key: {},
                    name: {},
                    description: {},
                },
            )
        } else {
            this.log('Favorites are not available')
        }
    }

    protected print_json (favorites: ChannelDTO[]|null): void {
        this.log(JSONs.stringify(favorites))
    }
}
