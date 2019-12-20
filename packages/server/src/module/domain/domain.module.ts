import {Module} from '@nestjs/common'

import {
    Configuration,
    IPlaybackStateProvider, PlaybackStateProvider,
    IPeriodicTrigger, PeriodicTrigger,
    ILogger,
    Notifier, IDigitallyImported, OnAirProvider, ChannelsProvider, FavoritesProvider,
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
            inject: ['ILogger', 'configuration', 'IPlaybackStateProvider'],
            provide: 'IPeriodicPlaybackStateUpdater',
            async useFactory (
                logger: ILogger,
                configuration: Configuration,
                playback_state_provider: IPlaybackStateProvider,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
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
            inject: ['ILogger', 'configuration', 'IDigitallyImported', 'OnAirProvider'],
            provide: 'IPeriodicOnAirUpdater',
            async useFactory (
                logger: ILogger,
                configuration: Configuration,
                digitally_imported: IDigitallyImported,
                on_air_provider: OnAirProvider,
            ): Promise<IPeriodicTrigger> {
                return new PeriodicTrigger(logger, {
                    interval_ms: configuration.di_frequency_ms,
                    async callback (): Promise<void> {
                        const data = await digitally_imported.load_now_playing()
                        await on_air_provider.update_with(data)
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
