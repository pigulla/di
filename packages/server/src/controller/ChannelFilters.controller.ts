import {Controller, Get, Inject} from '@nestjs/common'

import {ChannelFilterDTO} from '@digitally-imported/dto'

import {IChannelProvider} from '@server/service'

@Controller()
export class ChannelFiltersController {
    private readonly channel_provider: IChannelProvider

    public constructor (
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
    ) {
        this.channel_provider = channel_provider
    }

    @Get('/channelfilters')
    public list_channel_filters (): ChannelFilterDTO[] {
        return this.channel_provider.get_filters().map(filter => filter.to_dto())
    }
}
