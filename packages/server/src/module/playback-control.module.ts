import {Module} from '@nestjs/common'

import {UtilityModule} from './utility.module'
import {VlcControl} from '@server/service/playback'

@Module({
    imports: [
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IPlaybackControl',
            useClass: VlcControl,
        },
    ],
    exports: [
        'IPlaybackControl',
    ],
})
export class PlaybackControlModule {}
