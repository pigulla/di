import {Module} from '@nestjs/common'

import {
    Configuration,
    IPlaybackStateProvider, PlaybackStateProvider,
    IPeriodicTrigger, PeriodicTrigger,
    ILogger,
    Notifier,
    OnAirProvider,
    ChannelsProvider,
    FavoritesProvider,
} from '../../domain'
import {DigitallyImportedModule, UtilityModule, PlaybackControlModule} from '../infrastructure'

@Module({
    imports: [
        DigitallyImportedModule,
        PlaybackControlModule,
        UtilityModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'INotifier',
            useClass: Notifier,
        },
        {
            provide: 'IFavoritesProvider',
            useClass: FavoritesProvider,
        },
        {
            inject: ['configuration', 'ILogger', 'IPlaybackStateProvider'],
            provide: 'IPeriodicPlaybackStateUpdater',
            async useFactory (
                configuration: Configuration,
                logger: ILogger,
                playback_state_provider: IPlaybackStateProvider,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
                    log_id: 'playback-state-updater',
                    interval_ms: configuration.playback_state_check_frequency_ms,
                    async callback (): Promise<void> {
                        playback_state_provider.trigger_check()
                    },
                })
            },
        },
        {
            provide: 'IPlaybackStateProvider',
            useClass: PlaybackStateProvider,
        },
        {
            provide: 'OnAirProvider',
            useClass: OnAirProvider,
        },
        {
            inject: ['configuration', 'ILogger', 'OnAirProvider'],
            provide: 'IPeriodicOnAirUpdater',
            async useFactory (
                configuration: Configuration,
                logger: ILogger,
                on_air_provider: OnAirProvider,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
                    log_id: 'on-air-updater',
                    interval_ms: configuration.di_frequency_ms,
                    async callback (): Promise<void> {
                        await on_air_provider.trigger_update()
                    },
                })
            },
        },
        {
            provide: 'IChannelsProvider',
            useClass: ChannelsProvider,
        },
        {
            provide: 'IOnAirProvider',
            useExisting: OnAirProvider,
        },
    ],
    exports: [
        'IChannelsProvider',
        'IFavoritesProvider',
        'IOnAirProvider',
        'IPlaybackStateProvider',
        DigitallyImportedModule,
        PlaybackControlModule,
        UtilityModule,
    ],
})
export class DomainModule {}
