import {Module} from '@nestjs/common'

import {
    ChannelFiltersController,
    ChannelsController,
    FavoritesController,
    NowPlayingController,
    PlaybackController,
    ServerController,
    VolumeController,
} from '../controller'
import {
    CurrentlyPlayingModule,
    DigitallyImportedModule,
    PlaybackControlModule,
    UtilityModule,
} from '../module'

@Module({
    imports: [
        CurrentlyPlayingModule,
        DigitallyImportedModule,
        PlaybackControlModule,
        UtilityModule,
    ],
    controllers: [
        ChannelsController,
        ChannelFiltersController,
        FavoritesController,
        NowPlayingController,
        PlaybackController,
        ServerController,
        VolumeController,
    ],
    providers: [],
})
export class HttpModule {}
