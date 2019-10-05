import {ChannelFilterDTO} from '@digitally-imported/dto'
import {ClassSerializerInterceptor, Controller, Get, Inject, UseInterceptors} from '@nestjs/common'

import {IChannelProvider} from '../service'

@Controller()
export class ChannelFiltersController {
    private readonly channel_provider: IChannelProvider;

    public constructor (
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
    ) {
        this.channel_provider = channel_provider
    }

    @Get('/channelfilters')
    @UseInterceptors(ClassSerializerInterceptor)
    public list_channel_filters (): ChannelFilterDTO[] {
        return this.channel_provider.get_filters().map(filter => filter.to_dto())
    }
}
