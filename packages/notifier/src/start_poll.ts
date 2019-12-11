import {promisify} from 'util'

import {IClient} from '@digitally-imported/client'
import {PlaybackStateDTO} from '@digitally-imported/dto'
import {Notification} from 'node-notifier/notifiers/notificationcenter'

import {hash_state} from './hash_state'

const HASH_SERVER_NOT_RUNNING = 'server_not_running'
const HASH_NOT_YET_RUN = 'not_yet_run'

const server_not_running_notification: Notification = {
    title: 'Digitally Imported',
    message: 'Server not running',
}

const no_playback_notification: Notification = {
    title: 'Digitally Imported',
    message: 'Playback stopped',
}

const sleep = promisify(setTimeout)

export type StopFn = () => void
export type NotifyFn = (notification: Notification) => void

export function start_poll (client: IClient, poll_ms: number = 2_000, notify: NotifyFn): StopFn {
    let run = true

    async function poll_forever (previous_hash: string = HASH_NOT_YET_RUN): Promise<void> {
        const is_alive = await client.is_alive()
        let new_hash
        let notification: Notification|null = null
        let playback_state: PlaybackStateDTO|null = null

        if (!is_alive) {
            new_hash = HASH_SERVER_NOT_RUNNING
            notification = server_not_running_notification
        } else {
            playback_state = await client.get_playback_state()
            new_hash = hash_state(playback_state)
            notification = playback_state
                ? {
                    title: `Digitally Imported: ${playback_state.channel.name}`,
                    message: `${playback_state.now_playing.artist} - ${playback_state.now_playing.title}`,
                } : no_playback_notification
        }

        if (new_hash !== previous_hash) {
            notify(notification)
        }

        if (run) {
            await sleep(poll_ms)
            poll_forever(new_hash)
        }
    }

    poll_forever()

    // eslint-disable-next-line no-return-assign
    return () => run = false
}
