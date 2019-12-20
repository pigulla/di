import {Subscribable} from 'rxjs'

import {IChannel} from './di'

export type PlaybackState = PlaybackStoppedState|PlaybackInProgressState

export interface PlaybackStoppedState {
    stopped: true
}

export interface PlaybackInProgressState {
    stopped: false
    channel: IChannel
    song: {
        artist: string
        title: string
    }
}

export const PLAYBACK_STATE_STOPPED: PlaybackStoppedState = {
    stopped: true,
}

export interface IPlaybackStateProvider extends Subscribable<PlaybackState> {
    trigger_check (): Promise<void>
    get_state (): PlaybackState
}
