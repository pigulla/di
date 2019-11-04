import {join} from 'path'

import nock from 'nock'

export type RecordingName = 'homepage' | 'currently-playing'

export function load_nock_recording (name: RecordingName): void {
    const filename = join(__dirname, 'recording', `${name}.json`)

    nock.load(filename)
}
