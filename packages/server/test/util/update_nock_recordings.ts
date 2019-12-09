import {join, basename} from 'path'
import {createServer, IncomingMessage, ServerResponse} from 'http'
import {promises as fs} from 'fs'
import {URL} from 'url'
import {randomBytes} from 'crypto'
import {promisify} from 'util'
import {Socket} from 'net'

import Bluebird from 'bluebird'
import execa from 'execa'
import get_port from 'get-port'
import nock, {Definition} from 'nock'
import Superagent from 'superagent'
import {HttpStatus} from '@nestjs/common'

import {new_promise} from '@src/new_promise'

import {RecordingName} from './load_nock_recording'

// eslint-disable-next-line no-process-env
const listenkey: string = process.env.DI_LISTENKEY || ''
const sleep = promisify(setTimeout)

async function write_recording_to_file (name: RecordingName, definition: Definition): Promise<void> {
    const out_file = join(__dirname, 'recording', `${name}.json`)
    await fs.writeFile(out_file, JSON.stringify([definition], null, 4))
}

async function wait_for_port (port: number, retries: number = 3): Promise<void> {
    function try_connect (): Promise<boolean> {
        const socket = new Socket()

        return new Promise(function (resolve) {
            function on_connect (): void {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                clearTimeout(timeout_id)
                socket.destroy()
                resolve(true)
            }

            // eslint-disable-next-line handle-callback-err
            function on_error (_error: Error): void {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                clearTimeout(timeout_id)
                socket.off('connect', on_connect)
                resolve(false)
            }

            const timeout_id = setTimeout(function () {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                socket.off('connect', on_connect)
                socket.off('error', on_error)
                resolve(false)
            }, 500)

            socket
                .once('connect', on_connect)
                .once('error', on_error)
                .connect({port})
        })
    }

    for (let i = 0; i < retries; i++) {
        if (await try_connect()) {
            return
        }

        await sleep(1_000)
    }

    throw new Error('Timed out')
}

function with_nock (name: RecordingName, as_url?: string): Bluebird.Disposer<void> {
    nock.recorder.rec({
        dont_print: true,
        output_objects: true,
    })

    return Bluebird.resolve().disposer(async function (_arg: void, promise: Bluebird<void>) {
        if (promise.isRejected()) {
            return promise
        }

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

        await write_recording_to_file(name, definition)
    })
}

function with_webserver (port: number): Bluebird.Disposer<void> {
    const webserver = createServer()

    async function on_request (request: IncomingMessage, response: ServerResponse): Promise<void> {
        const file = join(__dirname, 'html', basename(request.url || ''))

        try {
            const content = await fs.readFile(file)
            response.writeHead(HttpStatus.OK, {'Content-Type': 'text/html'})
            response.write(content)
            response.end()
        } catch {
            response.writeHead(HttpStatus.NOT_FOUND, {'Content-Type': 'text/plain'})
            response.write('Not found')
            response.end()
        }
    }

    const server_promise: Bluebird<number> = new Bluebird(function (resolve) {
        webserver.on('request', on_request)
        webserver.once('listening', () => resolve(port))
        webserver.listen(port, 'localhost')
    })

    return server_promise.disposer(function () {
        const {promise, resolve} = new_promise<void>()

        webserver.once('close', () => resolve())
        webserver.close()

        return promise
    })
}

function with_vlc (port: number, password: string, channel_key: string|null = null): Bluebird.Disposer<void> {
    const vlc = execa('cvlc', [
        '--http-host=localhost',
        `--http-port=${port}`,
        `--http-password=${password}`,
        '--control=http',
        ...(channel_key ? [`http://listen.di.fm/premium/progressive.pls?listen_key=${listenkey}`] : []),
    ])

    return Bluebird
        .resolve(wait_for_port(port))
        .disposer(() => vlc.cancel())
}

(async function (): Promise<void> {
    const webserver_port = await get_port({port: 8888})
    const vlc_port = await get_port({port: 9999})
    const vlc_password = randomBytes(16).toString('hex')
    const superagent = Superagent.agent()
        .auth('', vlc_password)
        .set('Accept-Encoding', 'identity')

    async function save_to_file (name: RecordingName, url: string, as_url?: string): Promise<void> {
        return Bluebird.using(with_nock(name, as_url), async function () {
            await superagent.get(url)
        })
    }

    async function save_local_html_to_file (name: RecordingName, as_url: string): Promise<void> {
        await save_to_file(
            name,
            `http://localhost:${webserver_port}/${name}.html`,
            as_url,
        )
    }

    // await save_to_file(RecordingName.DI_HOMEPAGE, 'https://www.di.fm')
    await save_to_file(RecordingName.DI_CURRENTLY_PLAYING, 'https://www.di.fm/_papi/v1/di/currently_playing')

    await Bluebird.using(with_vlc(vlc_port, vlc_password), async function () {
        await save_to_file(
            RecordingName.VLC_PLAYLIST_NOT_PLAYING,
            `http://localhost:${vlc_port}/requests/playlist.xml`,
            'http://vlc.local/requests/playlist.xml',
        )
        await save_to_file(
            RecordingName.VLC_STATUS_NOT_PLAYING,
            `http://localhost:${vlc_port}/requests/status.xml`,
            'http://vlc.local/requests/status.xml',
        )
    })

    await Bluebird.using(with_vlc(vlc_port, vlc_password, 'progressive'), async function () {
        await sleep(2_000)
        await save_to_file(
            RecordingName.VLC_PLAYLIST,
            `http://localhost:${vlc_port}/requests/playlist.xml`,
            'http://vlc.local/requests/playlist.xml',
        )
        await save_to_file(
            RecordingName.VLC_STATUS,
            `http://localhost:${vlc_port}/requests/status.xml`,
            'http://vlc.local/requests/status.xml',
        )
    })

    await Bluebird.using(with_webserver(webserver_port), async function () {
        await save_local_html_to_file(RecordingName.DI_NO_SCRIPT_TAG, 'https://www.di.fm')
        await save_local_html_to_file(RecordingName.DI_NO_INTERCEPTOR_CALL, 'https://www.di.fm')
        await save_local_html_to_file(RecordingName.DI_EMPTY_INTERCEPTOR_CALL, 'https://www.di.fm')
    })
})().catch(function (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exitCode = 2
})
