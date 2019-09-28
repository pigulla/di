import {ChannelDTO} from '@digitally-imported/dto';
import {
    Controller,
    Get,
    Inject,
    Param,
    NotFoundException,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';

import {IChannelProvider} from '../service';
import {channel_to_dto} from './dto/';

@Controller()
export class ChannelsController {
    private readonly channel_provider: IChannelProvider;

    constructor (
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
    ) {
        this.channel_provider = channel_provider;
    }

    @Get('/channels')
    @UseInterceptors(ClassSerializerInterceptor)
    list_channels (): ChannelDTO[] {
        return this.channel_provider.get_channels().map(channel_to_dto);
    }

    @Get('/channel/:key')
    @UseInterceptors(ClassSerializerInterceptor)
    get_channel (@Param('key') key: string): ChannelDTO {
        if (!this.channel_provider.channel_exists(key)) {
            throw new NotFoundException();
        }

        return channel_to_dto(this.channel_provider.get_channel_by_key(key));
    }
}
