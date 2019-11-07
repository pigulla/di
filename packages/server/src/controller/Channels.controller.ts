import {
    Controller,
    Get,
    Inject,
    Param,
    NotFoundException,
} from '@nestjs/common'

import {ChannelDTO} from '@digitally-imported/dto'

import {IChannelProvider} from '@server/service'

@Controller()
export class ChannelsController {
    private readonly channel_provider: IChannelProvider

    public constructor (
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
    ) {
        this.channel_provider = channel_provider
    }

    @Get('/channels')
    public list_channels (): ChannelDTO[] {
        return this.channel_provider.get_all().map(channel => channel.to_dto())
    }

    @Get('/channel/:key')
    public get_channel (@Param('key') key: string): ChannelDTO {
        if (!this.channel_provider.channel_exists(key)) {
            throw new NotFoundException()
        }

        return this.channel_provider.get_by_key(key).to_dto()
    }
}
