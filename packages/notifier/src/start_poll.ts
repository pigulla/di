import {IClient} from '@digitally-imported/client'
import {PlaybackStateDTO} from '@digitally-imported/dto'
import {Notification} from 'node-notifier/notifiers/notificationcenter'

import {hash_state} from './hash_state'

const HASH_SERVER_NOT_RUNNING = 'server_not_running'

const server_not_running_notification: Notification = {
    title: 'Digitally Imported',
    message: 'Server not running',
}

const no_playback_notification: Notification = {
    title: 'Digitally Imported',
    message: 'Playback stopped',
}

export type StopFn = () => void
export type NotifyFn = (notification: Notification) => void

export async function start_poll (client: IClient, poll_ms: number = 2_000, notify: NotifyFn): Promise<StopFn> {
    let hash = ''
    let timeout_id: NodeJS.Timeout|null = null

    async function check_and_reschedule (): Promise<void> {
        timeout_id = setTimeout(check_and_reschedule, poll_ms)

        const prev_hash = hash
        const is_alive = await client.is_alive()
        let playback_state: PlaybackStateDTO|null = null

        if (!is_alive) {
            hash = HASH_SERVER_NOT_RUNNING
            return notify(server_not_running_notification)
        }

        playback_state = await client.get_playback_state()
        hash = hash_state(playback_state)

        if (hash === prev_hash) {
            // do nothing
        } else if (!playback_state) {
            notify(no_playback_notification)
        } else {
            const {title, artist} = playback_state.now_playing

            notify({
                title: `Digitally Imported: ${playback_state.channel.name}`,
                message: `${artist} - ${title}`,
            })
        }
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
