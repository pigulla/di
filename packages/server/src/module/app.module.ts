import {Module} from '@nestjs/common'

import {
    ChannelFiltersController,
    ChannelsController,
    NowPlayingController,
    PlaybackController,
    ServerController,
} from '../controller/'
import {
    DigitallyImportedModule,
    PlaybackControlModule,
    UtilityModule,
} from '../module'

@Module({
    imports: [
        DigitallyImportedModule,
        PlaybackControlModule,
        UtilityModule,
    ],
    controllers: [
        ChannelsController,
        ChannelFiltersController,
        NowPlayingController,
        PlaybackController,
        ServerController,
    ],
    providers: [],
})
export class AppModule {}
