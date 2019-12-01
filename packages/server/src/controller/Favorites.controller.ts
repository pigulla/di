import {Controller, Get, Inject, ForbiddenException} from '@nestjs/common'

import {ChannelDTO} from '@digitally-imported/dto'

import {IFavoritesProvider, CredentialsUnavailableError} from '@server/service'

@Controller()
export class FavoritesController {
    private readonly favorites_provider: IFavoritesProvider

    public constructor (
        @Inject('IFavoritesProvider') favorites_provider: IFavoritesProvider,
    ) {
        this.favorites_provider = favorites_provider
    }

    @Get('/favorites')
    public async list_favorites (): Promise<ChannelDTO[]> {
        try {
            const favorites = await this.favorites_provider.get_all()
            return favorites.map(favorite => favorite.to_dto())
        } catch (error) {
            if (error instanceof CredentialsUnavailableError) {
                throw new ForbiddenException()
            }

            throw error
        }
    }
}
