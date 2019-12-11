import {Module} from '@nestjs/common'

import {
    IPlaybackStateProvider, PlaybackStateProvider,
    IPeriodicTrigger, PeriodicTrigger,
} from '../service'
import {ILogger} from '../service/logger'
import {UtilityModule} from './utility.module'
import {DigitallyImportedModule} from './digitally-imported.module'
import {PlaybackControlModule} from './playback-control.module'

@Module({
    imports: [
        DigitallyImportedModule,
        PlaybackControlModule,
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'IPlaybackStateProvider',
            useClass: PlaybackStateProvider,
        },
        {
            inject: ['ILogger', 'IPlaybackStateProvider'],
            provide: 'IPeriodicPlaybackStateUpdater',
            async useFactory (
                logger: ILogger,
                playback_state_provider: IPlaybackStateProvider,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
                    interval_ms: 2_500,
                    async callback (): Promise<void> {
                        playback_state_provider.trigger_check()
                    },
                })
            },
        },
    ],
    exports: [
        'IPlaybackStateProvider',
    ],
})
export class CurrentlyPlayingModule {}
