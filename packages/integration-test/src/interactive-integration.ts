/* eslint-disable no-console */
import {promisify} from 'util'
import {join} from 'path'

import ora from 'ora'
import execa from 'execa'

import {start_server} from '@digitally-imported/server/lib/start_server'
import {ChannelDTO, PlaybackStateDTO} from '@digitally-imported/dto'

const sleep = promisify(setTimeout)
const VOLUME_MAX = 50
const VOLUME_STEP = 5

const BINARY = join(require.resolve('@digitally-imported/cli'), '..', '..', 'bin', 'run')

async function exec<T = void> (...args: string[]): Promise<T> {
    const {stdout} = await execa(BINARY, [...args, '--output-format', 'json'])

    return JSON.parse(stdout)
}

async function run (): Promise<void> {
    const spinner = ora()

    async function start_playback (channel: string): Promise<void> {
        spinner.start(`Starting playback of channel "${channel}"`)

        try {
            await exec('play', channel)
            spinner.succeed()
        } catch (error) {
            spinner.fail(`Error: ${error.message}`)
            process.exitCode = 1
        }
    }

    async function print_playback_state (): Promise<void> {
        spinner.start('Retrieving channel information')

        try {
            const playback_state = await exec<PlaybackStateDTO>('status')

            if (!playback_state) {
                spinner.fail('Playback state unavailable')
            } else if (!playback_state.now_playing) {
                spinner.fail('Unexpected playback state')
            } else {
                spinner.info(`Now playing: ${playback_state.now_playing.artist} - ${playback_state.now_playing.title}`)
            }
        } catch (error) {
            spinner.fail(`Error: ${error.message}`)
            process.exitCode = 2
        }
    }

    async function print_favorites (): Promise<void> {
        spinner.start('Retrieving favorites')

        try {
            const favorites = await exec<ChannelDTO[]|null>('favorites')

            if (favorites) {
                spinner.info(`Your favorites are: ${favorites.map(channel => channel.name).join(', ')}`)
            } else {
                spinner.warn('Credentials not available')
            }
        } catch (error) {
            spinner.fail(`Error: ${error.message}`)
            process.exitCode = 3
        }
    }

    async function set_volume (volume: number): Promise<void> {
        spinner.start(`Setting volume to ${volume}%`)

        try {
            await exec('set-volume', volume.toString())
            spinner.succeed()
        } catch (error) {
            spinner.fail(`Error: ${error.message}`)
            process.exitCode = 4
        }
    }

    console.log(`Using binary "${BINARY}"`)

    spinner.start('Starting server')
    const stop = await start_server([
        '--log-level', 'warn',
        '--port', '4979',
        '--hostname', 'localhost',
        '--notifications', 'notifier',
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

    await print_favorites()

    spinner.start('Stopping server')
    await stop()
    spinner.succeed()
}

run()
