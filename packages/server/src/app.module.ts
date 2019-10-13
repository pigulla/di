import {Module} from '@nestjs/common'

import {
    ChannelFiltersController,
    ChannelsController,
    FavoritesController,
    PlaybackController,
    ServerController,
    UserController,
    VolumeController,
} from './controller/'
import {
    AppDataModule,
    ConnectorModule,
    MiscModule,
} from './module'

@Module({
    imports: [
        MiscModule,
        ConnectorModule,
        AppDataModule,
    ],
    controllers: [
        ChannelsController,
        ChannelFiltersController,
        FavoritesController,
        PlaybackController,
        ServerController,
        UserController,
        VolumeController,
    ],
    providers: [],
})
export class AppModule {}
