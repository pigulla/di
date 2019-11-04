/* eslint-disable no-console */
import {join} from 'path'
import {promises as fs} from 'fs'

import nock from 'nock'
import superagent, {SuperAgentRequest} from 'superagent'

import {RecordingName} from './load_nock_recording'

async function save_to_file (request: SuperAgentRequest, name: RecordingName): Promise<void> {
    nock.recorder.rec({
        dont_print: true,
        output_objects: true,
    })

    const out_file = join(__dirname, 'recording', `${name}.json`)
    nock.recorder.clear()

    await request
    const calls = nock.recorder.play()
    nock.restore()

    console.log(`Saved ${request.url} as '${name}'`)
    await fs.writeFile(out_file, JSON.stringify(calls, null, 4))
}

(async function update_nock_recordings () {
    await save_to_file(
        superagent.get('https://www.di.fm'),
        'homepage',
    )

    await save_to_file(
        superagent.get('https://www.di.fm/_papi/v1/di/currently_playing'),
        'currently-playing',
    )
})().catch(function (error) {
    console.error(error)
    process.exitCode = 2
})
