import crypto from 'crypto'

import {PlaybackStateDTO} from '@digitally-imported/dto'

export function hash_state (playback_state: PlaybackStateDTO|null): string {
    const input = playback_state ? JSON.stringify(playback_state) : 'null'

    return crypto
        .createHash('md5')
        .update(input, 'utf8')
        .digest('hex')
}
