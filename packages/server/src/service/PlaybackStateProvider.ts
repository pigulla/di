import {Inject, Injectable} from '@nestjs/common'

import {PlaybackState, IPlaybackStateProvider, PLAYBACK_STATE_STOPPED} from './PlaybackStateProvider.interface'
import {IPlaybackControl} from './PlaybackControl.interface'
import {INowPlayingProvider} from './NowPlayingProvider.interface'
import {ILogger} from './logger'
import {IChannelsProvider} from './ChannelsProvider.interface'

type UpdateCallback = (state: PlaybackState) => void

export function states_differ (a: PlaybackState, b: PlaybackState): boolean {
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
export class PlaybackStateProvider implements IPlaybackStateProvider {
    private readonly update_callbacks: Array<[UpdateCallback, any]>
    private readonly logger: ILogger
    private readonly now_playing_provider: INowPlayingProvider
    private readonly playback_control: IPlaybackControl
    private readonly channels_provider: IChannelsProvider
    private state: PlaybackState

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('INowPlayingProvider') now_playing_provider: INowPlayingProvider,
        @Inject('IPlaybackControl') playback_control: IPlaybackControl,
        @Inject('IChannelsProvider') channels_provider: IChannelsProvider,
    ) {
        this.logger = logger.child_for_service(PlaybackStateProvider.name)
        this.playback_control = playback_control
        this.now_playing_provider = now_playing_provider
        this.channels_provider = channels_provider
        this.update_callbacks = []
        this.state = PLAYBACK_STATE_STOPPED

        this.logger.debug('Service instantiated')
    }

    public get_state (): PlaybackState {
        return this.state
    }

    private set_state (state: PlaybackState): void {
        if (!states_differ(this.state, state)) {
            return
        }

        this.logger.info('State changed', state)
        this.state = state
        this.update_callbacks.forEach(([callback, context]) => callback.call(context, state))
    }

    public async trigger_check (): Promise<void> {
        this.logger.debug('Check triggered')

        const channel_key = await this.playback_control.get_current_channel_key()

        if (!channel_key) {
            return this.set_state(PLAYBACK_STATE_STOPPED)
        }

        const channel = await this.channels_provider.get(channel_key)
        const now_playing = this.now_playing_provider.get(channel.key)

        this.set_state({
            stopped: false,
            channel,
            song: {
                artist: now_playing.display_artist,
                title: now_playing.display_title,
            },
        })
    }

    public on_update (callback: UpdateCallback, context?: any): void {
        this.update_callbacks.push([callback, context])
    }
}
