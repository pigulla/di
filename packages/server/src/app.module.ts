import {Module} from '@nestjs/common'

import {
    ChannelFiltersController,
    ChannelsController,
    NowPlayingController,
    PlaybackController,
    ServerController,
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
        NowPlayingController,
        PlaybackController,
        ServerController,
        VolumeController,
    ],
    providers: [],
})
export class AppModule {}
