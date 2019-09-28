import {ChannelFilterDTO} from '@digitally-imported/dto';
import {ClassSerializerInterceptor, Controller, Get, Inject, UseInterceptors} from '@nestjs/common';

import {IChannelProvider} from '../service';
import {channel_filter_to_dto} from './dto/ChannelFilter.dto';

@Controller()
export class ChannelFiltersController {
    private readonly channel_provider: IChannelProvider;

    constructor (
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
    ) {
        this.channel_provider = channel_provider;
    }

    @Get('/channelfilters')
    @UseInterceptors(ClassSerializerInterceptor)
    list_channel_filters (): ChannelFilterDTO[] {
        return this.channel_provider.get_filters().map(channel_filter_to_dto);
    }
}
