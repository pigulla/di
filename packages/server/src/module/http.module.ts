import {Module} from '@nestjs/common'

import {
    ChannelFiltersController,
    ChannelsController,
    NowPlayingController,
    PlaybackController,
    ServerController,
    VolumeController,
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
        VolumeController,
    ],
    providers: [],
})
export class HttpModule {}
