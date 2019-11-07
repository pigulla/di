import {promisify} from 'util'

import ora from 'ora'

import {start_server} from '@server/start_server'
import {Client} from '@client'

const sleep = promisify(setTimeout)
const VOLUME_MAX = 75
const VOLUME_STEP = 5

async function run (): Promise<void> {
    const client = new Client({endpoint: 'http://localhost:4979'})
    const spinner = ora()

    async function start_playback (channel: string): Promise<void> {
        spinner.start(`Starting playback of channel "${channel}"`)

        try {
            await client.start_playback(channel)
            spinner.succeed()
        } catch (error) {
            spinner.fail(`Error: ${error.message}`)
        }
    }

    async function print_playback_state (): Promise<void> {
        spinner.start('Retrieving channel information')
        try {
            const playback_state = await client.get_playback_state()
            if (!playback_state.now_playing) {
                spinner.fail('Unexpected playback state')
            } else {
                spinner.info(`Now playing: ${playback_state.now_playing.artist} - ${playback_state.now_playing.title}`)
            }
        } catch (error) {
            spinner.fail(`Error: ${error.message}`)
        }
    }

    async function set_volume (volume: number): Promise<void> {
        spinner.start(`Setting volume to ${volume}%`)

        try {
            await client.set_volume(volume)
            spinner.succeed()
        } catch (error) {
            spinner.fail(`Error: ${error.message}`)
        }
    }

    spinner.start('Starting server')
    const stop = await start_server([
        '--log-level', 'error',
        '--port', '4979',
        '--hostname', 'localhost',
        '--vlc-initial-volume', '0',
    ])
    spinner.succeed()

    await start_playback('progressive')

    for (let percent = 0; percent <= VOLUME_MAX; percent += VOLUME_STEP) {
        await set_volume(percent)
        await sleep(1000)
    }

    await print_playback_state()
    await start_playback('psychill')

    spinner.start('Playing channel for 5 seconds')
    await sleep(5000)
    await print_playback_state()

    spinner.start('Stopping server')
    await stop()
    spinner.succeed()
}

run()
