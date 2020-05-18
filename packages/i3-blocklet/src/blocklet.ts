import {IClient} from '@digitally-imported/client'
import truncate from 'lodash.truncate'

import {BlockletOutput} from './i3.interface'

export async function blocklet(client: IClient): Promise<BlockletOutput> {
    if (!(await client.is_alive())) {
        return {
            full_text: 'not running',
            short_text: 'n/a',
            color: '#808080',
        }
    }

    const state = await client.get_playback_state()

    if (!state) {
        return {
            full_text: 'paused',
            color: '#808080',
        }
    }

    return {
        full_text: `[${state.channel.name}] ${state.now_playing.artist} - ${state.now_playing.title}`,
        short_text: `${state.now_playing.artist}: ${truncate(state.now_playing.title)}`,
        color: '#ffffff',
    }
}
