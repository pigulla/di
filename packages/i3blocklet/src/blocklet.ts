import {Client} from '@digitally-imported/client'

import {Blocklet} from './blocklet.interface'

export async function blocket (client: Client): Promise<Blocklet> {
    if (!await client.is_alive()) {
        return {
            full_text: 'not running',
        }
    }

    const state = await client.get_playback_state()

    if (!state) {
        return {
            full_text: 'paused',
        }
    }

    const {artist, title} = state.now_playing
    const {name} = state.channel

    return {
        full_text: `${artist} - ${title} (${name})`,
    }
}
