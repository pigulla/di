import {
    Controller,
    Get,
    Inject,
    Param,
    NotFoundException,
} from '@nestjs/common'

import {ChannelDTO} from '@digitally-imported/dto'

import {IChannelsProvider} from '../service'

@Controller()
export class ChannelsController {
    private readonly channel_provider: IChannelsProvider

    public constructor (
        @Inject('IChannelsProvider') channel_provider: IChannelsProvider,
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

        return this.channel_provider.get(key).to_dto()
    }
}
