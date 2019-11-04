import {promisify} from 'util'

import ora from 'ora'
import superagent from 'superagent'

import {start_server} from '@server/start_server'

const sleep = promisify(setTimeout)
const VOLUME_MAX = 75
const VOLUME_STEP = 5

async function run (): Promise<void> {
    const spinner = ora().start('Starting server')
    const stop = await start_server([
        '--log-level', 'error',
        '--port', '4979',
        '--hostname', 'localhost',
        '--vlc-initial-volume', '0',
    ])
    spinner.succeed()

    spinner.start('Starting playback of channel "progressive"')
    await superagent.put('http://localhost:4979/playback').send({channel: 'progressive'})
    spinner.succeed()

    for (let percent = 0; percent <= VOLUME_MAX; percent += VOLUME_STEP) {
        spinner.start(`Setting volume to ${percent}%`)
        await superagent.put('http://localhost:4979/volume').send({volume: percent})
        spinner.succeed()
        await sleep(1000)
    }

    spinner.start('Starting playback of channel "psychill"')
    await superagent.put('http://localhost:4979/playback').send({channel: 'psychill'})
    spinner.succeed()

    spinner.start('Playing channel for 5 seconds')
    await sleep(5000)
    spinner.info()

    spinner.start('Stopping server')
    await stop()
    spinner.succeed()
}

run()
