import {ChannelDTO} from '@digitally-imported/dto';
import {
    Controller,
    Get,
    Inject,
    UseInterceptors,
    ClassSerializerInterceptor, ForbiddenException,
} from '@nestjs/common';

import {channel_to_dto} from './dto/';
import {IChannelProvider, IUserProvider} from '../service';
import {AuthenticatedUser} from '../service/di';

@Controller('/channels/favorites')
export class FavoritesController {
    private readonly channel_provider: IChannelProvider;
    private readonly user_provider: IUserProvider;

    constructor (
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
        @Inject('IUserProvider') user_provider: IUserProvider,
    ) {
        this.channel_provider = channel_provider;
        this.user_provider = user_provider;
    }

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    list_favorites (): ChannelDTO[] {
        const user = this.user_provider.get_user();

        if (user.is_public()) {
            throw new ForbiddenException();
        }

        return (user as AuthenticatedUser).favorites
            .map(id => this.channel_provider.get_channel_by_id(id))
            .map(channel => channel_to_dto(channel));
    }
}
