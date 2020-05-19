import {Controller, Get, Inject, Param, NotFoundException} from '@nestjs/common'

import {OnAirDTO} from '@digitally-imported/dto'

import {IOnAirProvider} from '../../domain'

@Controller()
export class OnAirController {
    private readonly on_air_provider: IOnAirProvider

    public constructor(@Inject('IOnAirProvider') on_air_provider: IOnAirProvider) {
        this.on_air_provider = on_air_provider
    }

    @Get('/channels/on_air')
    public on_air(): OnAirDTO[] {
        const on_air = this.on_air_provider.get_all()

        return on_air.map(now_playing => now_playing.to_dto())
    }

    @Get('/channel/:key/on_air')
    public on_air_on_channel(@Param('key') key: string): OnAirDTO {
        try {
            const now_playing = this.on_air_provider.get_by_channel_key(key)
            return now_playing.to_dto()
        } catch (error) {
            throw new NotFoundException()
        }
    }
}
