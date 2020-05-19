import {join} from 'path'

import nock from 'nock'

export enum RecordingName {
    DI_HOMEPAGE = 'di-homepage',
    DI_CURRENTLY_PLAYING = 'di-currently-playing',
    DI_EMPTY_INTERCEPTOR_CALL = 'di-empty-interceptor-call',
    DI_NO_INTERCEPTOR_CALL = 'di-no-interceptor-call',
    DI_NO_SCRIPT_TAG = 'di-no-script-tag',
    VLC_PLAYLIST = 'vlc-playlist',
    VLC_PLAYLIST_NOT_PLAYING = 'vlc-playlist-not-playing',
    VLC_STATUS = 'vlc-status',
    VLC_STATUS_NOT_PLAYING = 'vlc-status-not-playing',
}

export function load_nock_recording(name: RecordingName): void {
    const filename = join(__dirname, 'recording', `${name}.json`)

    nock.load(filename)
}
