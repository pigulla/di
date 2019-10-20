import {
    Controller,
    Get,
    Inject,
    Param,
    NotFoundException,
} from '@nestjs/common'

import {NowPlayingDTO} from '@digitally-imported/dto'

import {INowPlayingProvider} from '@server/service'

@Controller()
export class NowPlayingController {
    private readonly now_playing_provider: INowPlayingProvider;

    public constructor (
        @Inject('INowPlayingProvider') now_playing_provider: INowPlayingProvider,
    ) {
        this.now_playing_provider = now_playing_provider
    }

    @Get('/channels/now_playing')
    public now_playing (): NowPlayingDTO[] {
        const now_playing = this.now_playing_provider.get_all()

        return now_playing.map(item => item.to_dto())
    }

    @Get('/channel/:key/now_playing')
    public now_playing_on_channel (@Param('key') key: string): NowPlayingDTO {
        try {
            const now_playing = this.now_playing_provider.get_by_channel_key(key)
            return now_playing.to_dto()
        } catch (error) {
            throw new NotFoundException()
        }
    }
}
