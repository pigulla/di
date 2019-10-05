import {Body, Controller, Inject, Put, Get, HttpStatus, HttpCode} from '@nestjs/common'
import {Min, Max, IsNumber} from 'class-validator'

import {IVlcControl} from '../service'

export class VolumeDTO {
    @IsNumber()
    @Min(0)
    @Max(1.25)
    public volume!: number;
}

@Controller('/volume')
export class VolumeController {
    private readonly vlc_control: IVlcControl;

    public constructor (
        @Inject('IVlcControl') vlc_control: IVlcControl,
    ) {
        this.vlc_control = vlc_control
    }

    @Get()
    public async get_volume (): Promise<VolumeDTO> {
        const volume = await this.vlc_control.get_volume()

        return {volume}
    }

    @Put()
    @HttpCode(HttpStatus.NO_CONTENT)
    public async set_volume (@Body() volume_dto: VolumeDTO): Promise<void> {
        const {volume} = volume_dto

        await this.vlc_control.set_volume(volume)
    }
}
