import {ChannelDTO, PlaybackStateDTO} from '@digitally-imported/dto'
import {
    Body,
    ClassSerializerInterceptor,
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
    UseInterceptors,
} from '@nestjs/common'
import {IsString} from 'class-validator'

import {IChannelProvider, IListenKeyProvider, IVlcControl} from '../service'

export class PlayDTO {
    @IsString()
    public readonly channel!: string;
}

@Controller('/playback')
export class PlaybackController {
    private readonly vlc_control: IVlcControl;
    private readonly channel_provider: IChannelProvider;
    private readonly listen_key_provider: IListenKeyProvider;

    public constructor (
        @Inject('IVlcControl') vlc_control: IVlcControl,
        @Inject('IChannelProvider') channel_provider: IChannelProvider,
        @Inject('IListenKeyProvider') listen_key_provider: IListenKeyProvider,
    ) {
        this.vlc_control = vlc_control
        this.listen_key_provider = listen_key_provider
        this.channel_provider = channel_provider
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
    @UseInterceptors(ClassSerializerInterceptor)
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
        const matches = /^(.+)\?[a-z0-9]+$/.exec(filename)

        if (!matches) {
            throw new InternalServerErrorException()
        }
        const channel = this.channel_provider.get_channel_by_key(matches[1])

        return Object.assign(state, {now_playing, channel})
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async stop (): Promise<void> {
        await this.vlc_control.stop()
    }

    @Put()
    @UseInterceptors(ClassSerializerInterceptor)
    public async play (@Body() play_dto: PlayDTO): Promise<ChannelDTO> {
        const {channel: identifier} = play_dto

        if (!this.channel_provider.channel_exists(identifier)) {
            throw new NotFoundException()
        }

        const channel = this.channel_provider.get_channel_by_key(identifier)
        const url = channel.build_url(this.listen_key_provider.get_listen_key())

        await this.vlc_control.add(url)

        return channel.to_dto()
    }
}
