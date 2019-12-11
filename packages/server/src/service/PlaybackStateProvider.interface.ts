import {IUpdateNotifier} from './UpdateNotifier.interface'
import {Channel} from './di'

export interface PlaybackStoppedState {
    stopped: true
}

export interface PlaybackInProgressState {
    stopped: false
    channel: Channel
    song: {
        artist: string
        title: string
    }
}

export type PlaybackState = PlaybackStoppedState|PlaybackInProgressState

export interface IPlaybackStateProvider extends IUpdateNotifier<PlaybackState> {
    trigger_check (): Promise<void>
    get_state (): PlaybackState
}

export const PLAYBACK_STATE_STOPPED: PlaybackStoppedState = {
    stopped: true,
}
