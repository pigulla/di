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
    InternalServerErrorException,
    NotFoundException,
    Put,
} from '@nestjs/common'

import {ChannelDTO, PlaybackStateDTO} from '@digitally-imported/dto'

import {IChannelProvider, IVlcControl, IConfigProvider} from '@server/service'

export class PlayDTO {
    @IsString()
    @IsNotEmpty()
    public readonly channel!: string
}

@Controller('/playback')
export class PlaybackController {
    private readonly vlc_control: IVlcControl;
    private readonly channel_provider: IChannelProvider;
    private readonly config_provider: IConfigProvider;

    public constructor (
        @Inject('IVlcControl') vlc_control: IVlcControl,
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
        @Inject('IConfigProvider') config_provider: IConfigProvider,
    ) {
        this.vlc_control = vlc_control
        this.channel_provider = channel_provider
        this.config_provider = config_provider
    }

    @Head()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async is_playing (): Promise<void> {
        const is_playing = await this.vlc_control.is_playing()

        if (!is_playing) {
            throw new NotFoundException()
        }
    }

    @Get()
    public async current (): Promise<PlaybackStateDTO> {
        const state: PlaybackStateDTO = {
            now_playing: false,
            channel: null,
            volume: await this.vlc_control.get_volume(),
        }

        const info = await this.vlc_control.info()

        if (!info) {
            return state
        }

        const {filename, now_playing} = info
        const matches = /^(?:.+)\?([a-z0-9]+)$/.exec(filename)

        if (!matches) {
            throw new InternalServerErrorException()
        }
        const channel = this.channel_provider.get_by_key(matches[1])

        return Object.assign(state, {now_playing, channel: channel.to_dto()})
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async stop (): Promise<void> {
        await this.vlc_control.stop()
    }

    @Put()
    public async play (@Body() play_dto: PlayDTO): Promise<ChannelDTO> {
        const {channel: identifier} = play_dto

        if (!this.channel_provider.channel_exists(identifier)) {
            throw new NotFoundException()
        }

        const {di_listenkey, di_quality} = this.config_provider
        const channel = this.channel_provider.get_by_key(identifier)
        const url = channel.build_url(di_listenkey, di_quality)

        await this.vlc_control.add(url)

        return channel.to_dto()
    }
}
