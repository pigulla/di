/* eslint-disable no-console */
import {join, basename} from 'path'
import {createServer, IncomingMessage, Server, ServerResponse} from 'http'
import {promises as fs} from 'fs'
import {AddressInfo} from 'net'
import {URL} from 'url'

import nock, {Definition} from 'nock'
import superagent from 'superagent'

import {new_promise} from '@server/new_promise'

import {RecordingName} from './load_nock_recording'

class NockRecordingUpdater {
    private readonly server: Server

    public constructor () {
        this.server = createServer()
    }

    public async start_webserver (): Promise<void> {
        const {promise, resolve} = new_promise<void>()

        this.server.on('request', this.on_request.bind(this))
        this.server.once('listening', () => resolve())
        this.server.listen(0, 'localhost')

        return promise
    }

    public async stop_webserver (): Promise<void> {
        const {promise, resolve} = new_promise<void>()

        this.server.once('close', () => resolve())
        this.server.close()

        return promise
    }

    private get server_port (): number {
        const address = this.server.address() as AddressInfo
        return address.port
    }

    private async on_request (request: IncomingMessage, response: ServerResponse): Promise<void> {
        const file = join(__dirname, 'html', basename(request.url || ''))

        try {
            const content = await fs.readFile(file)
            response.writeHead(200, {'Content-Type': 'text/html'})
            response.write(content)
            response.end()
        } catch {
            response.writeHead(200, {'Content-Type': 'text/plain'})
            response.write('Not found')
            response.end()
        }
    }

    private async write_recording_to_file (name: RecordingName, definition: Definition): Promise<void> {
        const out_file = join(__dirname, 'recording', `${name}.json`)
        console.log(`Saving recording "${name}"`)
        await fs.writeFile(out_file, JSON.stringify([definition], null, 4))
    }

    public async save_local_html_to_file (name: RecordingName, as_url: string): Promise<void> {
        await this.save_to_file(
            name,
            `http://localhost:${this.server_port}/${name}.html`,
            as_url,
        )
    }

    public async save_to_file (name: RecordingName, url: string, as_url?: string): Promise<void> {
        nock.recorder.rec({
            dont_print: true,
            output_objects: true,
        })

        await superagent.get(url)
        const calls = nock.recorder.play()
        nock.recorder.clear()
        nock.restore()

        if (calls.length !== 1) {
            throw new Error(`Expected exactly one recording but got ${calls.length}`)
        }
        const definition = calls[0] as Definition

        if (as_url) {
            const {protocol, hostname, port, pathname} = new URL(as_url)

            definition.scope = `${protocol}//${hostname}${port === '' ? '' : `:${port}`}`
            definition.path = pathname
        }

        await this.write_recording_to_file(name, definition)
    }
}

(async function update_nock_recordings () {
    const updater = new NockRecordingUpdater()

    await updater.start_webserver()

    try {
        await updater.save_to_file(RecordingName.HOMEPAGE, 'https://www.di.fm')
        await updater.save_to_file(RecordingName.CURRENTLY_PLAYING, 'https://www.di.fm/_papi/v1/di/currently_playing')

        await updater.save_local_html_to_file(RecordingName.NO_SCRIPT_TAG, 'https://www.di.fm')
        await updater.save_local_html_to_file(RecordingName.NO_INTERCEPTOR_CALL, 'https://www.di.fm')
        await updater.save_local_html_to_file(RecordingName.EMPTY_INTERCEPTOR_CALL, 'https://www.di.fm')
    } finally {
        await updater.stop_webserver()
    }
})().catch(function (error) {
    console.error(error)
    process.exitCode = 2
})
