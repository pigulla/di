import {Inject, Injectable} from '@nestjs/common'

import {INotificationProvider} from './NotificationProvider.interface'
import {INotifier} from './Notifier.interface'
import {IPlaybackStateProvider, PlaybackState} from './PlaybackStateProvider.interface'

@Injectable()
export class Notifier implements INotifier {
    private readonly notification_provider: INotificationProvider
    private readonly playback_state_provider: IPlaybackStateProvider

    public constructor(
        @Inject('INotificationProvider') notification_provider: INotificationProvider,
        @Inject('IPlaybackStateProvider') playback_state_provider: IPlaybackStateProvider
    ) {
        this.notification_provider = notification_provider
        this.playback_state_provider = playback_state_provider

        this.playback_state_provider.subscribe(this.on_new_playback_state.bind(this))
    }

    public onApplicationBootstrap(): void {
        this.notification_provider.send('Digitally Imported', 'Server started')
    }

    public onApplicationShutdown(_signal?: string): void {
        this.notification_provider.send('Digitally Imported', 'Server stopped')
    }

    protected on_new_playback_state(state: PlaybackState): void {
        if (state.stopped) {
            this.notification_provider.send('Digitally Imported', 'Playback stopped')
        } else {
            this.notification_provider.send(
                `Digitally Imported: ${state.channel.name}`,
                `${state.song.artist} - ${state.song.title}`
            )
        }
    }
}
