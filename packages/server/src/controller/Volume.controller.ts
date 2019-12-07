import {IsNotEmpty, IsNumber, Max, Min} from 'class-validator'
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Put,
} from '@nestjs/common'

import {IPlaybackControl} from '@src/service'

export class VolumeDTO {
    @IsNumber()
    @Min(0)
    @Max(125)
    @IsNotEmpty()
    public readonly volume!: number
}

@Controller('/volume')
export class VolumeController {
    private readonly playback_control: IPlaybackControl

    public constructor (
        @Inject('IPlaybackControl') vlc_control: IPlaybackControl,
    ) {
        this.playback_control = vlc_control
    }

    @Get()
    public async get_volume (): Promise<VolumeDTO> {
        const volume = await this.playback_control.get_volume()

        return {
            volume: Math.round(volume * 100),
        }
    }

    @Put()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async set_volume (@Body() volume_dto: VolumeDTO): Promise<void> {
        await this.playback_control.set_volume(volume_dto.volume / 100)
    }
}
