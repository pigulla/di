import {join} from 'path'

import nock from 'nock'

export enum RecordingName {
    HOMEPAGE = 'homepage',
    CURRENTLY_PLAYING = 'currently-playing',
    EMPTY_INTERCEPTOR_CALL = 'empty-interceptor-call',
    NO_INTERCEPTOR_CALL = 'no-interceptor-call',
    NO_SCRIPT_TAG = 'no-script-tag',
}

export function load_nock_recording (name: RecordingName): void {
    const filename = join(__dirname, 'recording', `${name}.json`)

    nock.load(filename)
}
