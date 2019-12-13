import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'

import {AppVersionHeader} from '../../application/middleware'
import {
    ChannelFiltersController,
    ChannelsController,
    FavoritesController,
    NowPlayingController,
    PlaybackController,
    ServerController,
    VolumeController,
} from '../../application/controller'

import {DigitallyImportedModule, PlaybackControlModule, UtilityModule} from '../infrastructure'
import {DomainModule} from '../domain'

@Module({
    imports: [
        DigitallyImportedModule,
        DomainModule,
        PlaybackControlModule,
        UtilityModule,
    ],
    controllers: [
        ChannelFiltersController,
        ChannelsController,
        FavoritesController,
        NowPlayingController,
        PlaybackController,
        ServerController,
        VolumeController,
    ],
    providers: [],
})
export class ControllerModule implements NestModule {
    public configure (consumer: MiddlewareConsumer): void {
        consumer
            .apply(AppVersionHeader)
            .forRoutes('*')
    }
}
