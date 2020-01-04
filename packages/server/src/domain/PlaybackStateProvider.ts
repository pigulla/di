import {Subject} from 'rxjs'
import {Inject, Injectable} from '@nestjs/common'

import {PlaybackState, IPlaybackStateProvider, PLAYBACK_STATE_STOPPED} from './PlaybackStateProvider.interface'
import {IPlaybackControl} from './PlaybackControl.interface'
import {IOnAirProvider} from './OnAirProvider.interface'
import {ILogger} from './Logger.interface'
import {IChannelsProvider} from './ChannelsProvider.interface'

export function playback_states_differ (a: PlaybackState, b: PlaybackState): boolean {
    if (a.stopped !== b.stopped) {
        return true
    } else if (a.stopped || b.stopped) {
        return false
    } else {
        return (
            (a.channel.id !== b.channel.id) ||
            (a.song.artist !== b.song.artist) ||
            (a.song.title !== b.song.title)
        )
    }
}

@Injectable()
export class PlaybackStateProvider extends Subject<PlaybackState> implements IPlaybackStateProvider {
    private readonly logger: ILogger
    private readonly on_air_provider: IOnAirProvider
    private readonly playback_control: IPlaybackControl
    private readonly channels_provider: IChannelsProvider
    private state: PlaybackState

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IOnAirProvider') now_playing_provider: IOnAirProvider,
        @Inject('IPlaybackControl') playback_control: IPlaybackControl,
        @Inject('IChannelsProvider') channels_provider: IChannelsProvider,
    ) {
        super()

        this.logger = logger.child_for_service(PlaybackStateProvider.name)
        this.playback_control = playback_control
        this.on_air_provider = now_playing_provider
        this.channels_provider = channels_provider
        this.state = PLAYBACK_STATE_STOPPED

        this.logger.debug('Service instantiated')
    }

    public get_state (): PlaybackState {
        return this.state
    }

    private set_state (state: PlaybackState): void {
        if (!playback_states_differ(this.state, state)) {
            return
        }

        this.logger.info('State changed', state)
        this.state = state
        this.next(state)
    }

    public async trigger_check (): Promise<void> {
        this.logger.trace('Check triggered')

        const is_playing = await this.playback_control.is_playing()
        const channel_key = await this.playback_control.get_current_channel_key()

        if (!is_playing || !channel_key) {
            return this.set_state(PLAYBACK_STATE_STOPPED)
        }

        const channel = this.channels_provider.get(channel_key)
        const now_playing = this.on_air_provider.get(channel.key)

        this.set_state({
            stopped: false,
            channel,
            song: {
                artist: now_playing.artist || 'unknown',
                title: now_playing.title || 'unknown',
            },
        })
    }
}
