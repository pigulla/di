import {IsNotEmpty, IsString} from 'class-validator'
import {
    Body,
    Controller,
    Delete,
    Get,
    Head,
    HttpCode,
    HttpStatus,
    Inject,
    NotFoundException,
    Put,
} from '@nestjs/common'

import {ChannelDTO, PlayDTO, PlaybackStateDTO} from '@digitally-imported/dto'

import {IChannelsProvider, IPlaybackControl, IConfigProvider, INowPlayingProvider} from '@server/service'

class ValidatedPlayDTO extends PlayDTO {
    @IsString()
    @IsNotEmpty()
    public readonly channel!: string
}

@Controller('/playback')
export class PlaybackController {
    private readonly playback_control: IPlaybackControl
    private readonly channel_provider: IChannelsProvider
    private readonly config_provider: IConfigProvider
    private readonly now_playing_provider: INowPlayingProvider

    public constructor (
        @Inject('IPlaybackControl') vlc_control: IPlaybackControl,
        @Inject('IChannelsProvider') channel_provider: IChannelsProvider,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
        @Inject('INowPlayingProvider') now_playing_provider: INowPlayingProvider,
    ) {
        this.playback_control = vlc_control
        this.channel_provider = channel_provider
        this.config_provider = config_provider
        this.now_playing_provider = now_playing_provider
    }

    @Head()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async is_playing (): Promise<void> {
        const is_playing = await this.playback_control.is_playing()

        if (!is_playing) {
            throw new NotFoundException()
        }
    }

    @Get()
    public async current (): Promise<PlaybackStateDTO> {
        const channel_key = await this.playback_control.get_current_channel_key()

        if (!channel_key) {
            throw new NotFoundException()
        }

        const now_playing = this.now_playing_provider.get_by_channel_key(channel_key)
        const channel = this.channel_provider.get(channel_key)

        return {
            now_playing: {
                artist: now_playing.display_artist,
                title: now_playing.display_title,
            },
            channel: channel.to_dto(),
        }
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async stop (): Promise<void> {
        await this.playback_control.stop()
    }

    @Put()
    public async play (@Body() play_dto: ValidatedPlayDTO): Promise<ChannelDTO> {
        const {channel: identifier} = play_dto

        if (!this.channel_provider.channel_exists(identifier)) {
            throw new NotFoundException()
        }

        const {di_listenkey, di_quality} = this.config_provider
        const channel = this.channel_provider.get(identifier)
        const url = channel.build_url(di_listenkey, di_quality)

        await this.playback_control.play(url)

        return channel.to_dto()
    }
}
