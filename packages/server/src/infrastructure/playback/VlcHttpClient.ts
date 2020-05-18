import {Inject, Injectable} from '@nestjs/common'
import clamp from 'lodash.clamp'
import superagent from 'superagent'
import {parseStringPromise as parse_xml} from 'xml2js'

import {ILogger} from '../../domain'
import {Channel} from '../di'

import {IVlcHttpClient, Status, PlaybackState, VlcHttpConnection} from './VlcHttpClient.interface'

// See: https://wiki.videolan.org/VLC_HTTP_requests/

function volume_from_percentage(percent: number): number {
    return clamp(percent, 0, 1.25) * 256
}

function volume_to_percentage(volume: number): number {
    return clamp(volume / 256, 0, 1.25)
}

@Injectable()
export class VlcHttpClient implements IVlcHttpClient {
    private readonly logger: ILogger
    private readonly vlc_http_connection: VlcHttpConnection

    public constructor(
        @Inject('ILogger') logger: ILogger,
        @Inject('vlc_http_connection') vlc_http_connection: VlcHttpConnection
    ) {
        this.logger = logger.child_for_service(VlcHttpClient.name)
        this.vlc_http_connection = vlc_http_connection

        this.logger.debug('Service instantiated')
    }

    private async status(query: object = {}): Promise<Status> {
        const {hostname, port, password} = this.vlc_http_connection
        const url = `http://${hostname}:${port}/requests/status.xml`

        const response = await superagent.get(url).query(query).auth('', password)
        const xml = (await parse_xml(response.text, {explicitArray: false})) as any

        const result: Status = {
            volume: parseInt(xml.root.volume, 10),
            apiversion: parseInt(xml.root.apiversion, 10),
            state: xml.root.state as PlaybackState,
            version: xml.root.version as string,
            meta: null,
        }

        if (Array.isArray(xml.root.information.category)) {
            const meta = xml.root.information.category.find((item: any) => item.$.name === 'meta')

            if (meta) {
                result.meta = {
                    filename: meta.info.find((item: any) => item.$.name === 'filename')._ as string,
                    genre: (meta.info.find((item: any) => item.$.name === 'genre')
                        ._ as string).trim(),
                    title: (meta.info.find((item: any) => item.$.name === 'title')
                        ._ as string).trim(),
                }
            }
        }

        return result
    }

    public async get_current_channel_key(): Promise<string | null> {
        const {hostname, port, password} = this.vlc_http_connection
        const url = `http://${hostname}:${port}/requests/playlist.xml`

        const response = await superagent.get(url).auth('', password)
        const xml = (await parse_xml(response.text, {explicitArray: false})) as any
        const playlist_node = xml.node.node.find((node: any) => node.$.name === 'Playlist')

        if (!playlist_node?.leaf?.find) {
            return null
        }

        const current_node = playlist_node.leaf.find((leaf: any) => leaf.$.current === 'current')

        if (!current_node) {
            return null
        }

        return Channel.get_key_from_url(current_node.$.uri)
    }

    public async get_status(): Promise<Status> {
        return this.status()
    }

    public async play(url: string): Promise<void> {
        await this.status({command: 'in_play', input: url})
    }

    public async stop(): Promise<void> {
        await this.status({command: 'pl_stop'})
    }

    public async adjust_volume_by(volume: number): Promise<void> {
        const sgn = volume >= 0 ? '+' : '-'
        const val = volume_from_percentage(volume)

        await this.status({command: 'volume', val: `${sgn}${val}`})
    }

    public async set_volume(volume: number): Promise<void> {
        const val = volume_from_percentage(volume)

        await this.status({command: 'volume', val})
    }

    public async get_volume(): Promise<number> {
        const status = await this.get_status()

        return volume_to_percentage(status.volume)
    }

    public async is_playing(): Promise<boolean> {
        const status = await this.get_status()

        return status.state === PlaybackState.PLAYING
    }
}
