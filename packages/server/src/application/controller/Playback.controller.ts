import {ChannelDTO, PlayDTO, PlaybackStateDTO} from '@digitally-imported/dto'
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
import {IsNotEmpty, IsString} from 'class-validator'

import {
    Configuration,
    IChannelsProvider,
    IPlaybackControl,
    IPlaybackStateProvider,
} from '../../domain'

class ValidatedPlayDTO extends PlayDTO {
    @IsString()
    @IsNotEmpty()
    public readonly channel!: string
}

@Controller('/playback')
export class PlaybackController {
    private readonly channel_provider: IChannelsProvider
    private readonly configuration: Configuration
    private readonly playback_control: IPlaybackControl
    private readonly playback_state_provider: IPlaybackStateProvider

    public constructor(
        @Inject('configuration') config_provider: Configuration,
        @Inject('IChannelsProvider') channel_provider: IChannelsProvider,
        @Inject('IPlaybackControl') vlc_control: IPlaybackControl,
        @Inject('IPlaybackStateProvider') playback_state_provider: IPlaybackStateProvider
    ) {
        this.channel_provider = channel_provider
        this.configuration = config_provider
        this.playback_control = vlc_control
        this.playback_state_provider = playback_state_provider
    }

    @Head()
    @HttpCode(HttpStatus.NO_CONTENT)
    public is_playing(): void {
        const state = this.playback_state_provider.get_state()

        if (state.stopped) {
            throw new NotFoundException()
        }
    }

    @Get()
    public current(): PlaybackStateDTO {
        const state = this.playback_state_provider.get_state()

        if (state.stopped) {
            throw new NotFoundException()
        }

        return {
            now_playing: {
                artist: state.song.artist,
                title: state.song.title,
            },
            channel: state.channel.to_dto(),
        }
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async stop(): Promise<void> {
        await this.playback_control.stop()
    }

    @Put()
    public async play(@Body() play_dto: ValidatedPlayDTO): Promise<ChannelDTO> {
        const {channel: identifier} = play_dto

        if (!this.channel_provider.channel_exists(identifier)) {
            throw new NotFoundException()
        }

        // TODO: Move functionality to domain
        const {di_listenkey, di_quality} = this.configuration
        const channel = this.channel_provider.get(identifier)
        const url = channel.build_url(di_listenkey, di_quality)

        await this.playback_control.play(url)

        return channel.to_dto()
    }
}
