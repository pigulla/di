import {Controller, Get, Inject} from '@nestjs/common'

import {ChannelFilterDTO} from '@digitally-imported/dto'

import {IChannelsProvider} from '../../domain'

@Controller()
export class ChannelFiltersController {
    private readonly channel_provider: IChannelsProvider

    public constructor(@Inject('IChannelsProvider') channel_provider: IChannelsProvider) {
        this.channel_provider = channel_provider
    }

    @Get('/channelfilters')
    public list_channel_filters(): ChannelFilterDTO[] {
        return this.channel_provider.get_filters().map(filter => filter.to_dto())
    }
}
