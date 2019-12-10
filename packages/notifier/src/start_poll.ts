import {Client} from '@digitally-imported/client'
import notifier from 'node-notifier'

import {hash_state} from './hash_state'

export type StopFn = () => void

export async function start_poll (client: Client, poll_ms: number = 2_000): Promise<StopFn> {
    let prev_hash = ''
    let timeout_id: NodeJS.Timeout|null = null

    async function check_and_reschedule (): Promise<void> {
        const playback_state = await client.get_playback_state()
        const new_hash = hash_state(playback_state)

        if (new_hash !== prev_hash) {
            prev_hash = new_hash

            if (playback_state) {
                const {title, artist} = playback_state.now_playing

                notifier.notify({
                    title: `Digitally Imported: ${playback_state.channel.name}`,
                    message: `${artist} - ${title}`,
                })
            } else {
                notifier.notify({
                    title: 'Digitally Imported',
                    message: 'Playback stopped',
                })
            }
        }

        timeout_id = setTimeout(check_and_reschedule, poll_ms)
    }

    function stop (): void {
        if (timeout_id) {
            clearTimeout(timeout_id)
            timeout_id = null
        }
    }

    await check_and_reschedule()

    return stop
}
