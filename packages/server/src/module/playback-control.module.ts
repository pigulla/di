import {Module} from '@nestjs/common'

import {UtilityModule} from './utility.module'
import {ChildProcessFacade, Connector, VlcControl} from '@server/service/playback/vlc'

@Module({
    imports: [
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'ChildProcessFacadeCtor',
            useValue: ChildProcessFacade,
        },
        {
            provide: 'ConnectorCtor',
            useValue: Connector,
        },
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
