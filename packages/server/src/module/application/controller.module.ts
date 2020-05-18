import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'

import {
    ChannelFiltersController,
    ChannelsController,
    FavoritesController,
    OnAirController,
    PlaybackController,
    ServerController,
    VolumeController,
} from '../../application/controller'
import {AppVersionHeader} from '../../application/middleware'
import {DomainModule} from '../domain'

@Module({
    imports: [DomainModule],
    controllers: [
        ChannelFiltersController,
        ChannelsController,
        FavoritesController,
        OnAirController,
        PlaybackController,
        ServerController,
        VolumeController,
    ],
    providers: [],
})
export class ControllerModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AppVersionHeader).forRoutes('*')
    }
}
