import {expect} from 'chai'
import {stub, SinonStubbedInstance} from 'sinon'
import {IClient} from '@digitally-imported/client'
import {PlaybackStateDTO} from '@digitally-imported/dto'

import {blocklet} from '@src/blocklet'
import {PartialDeep} from 'type-fest'

function create_client_stub (): SinonStubbedInstance<IClient> {
    return {
        is_alive: stub(),
        shutdown: stub(),
        get_server_status: stub(),
        update: stub(),
        set_volume: stub(),
        get_volume: stub(),
        is_playing: stub(),
        start_playback: stub(),
        stop_playback: stub(),
        get_playback_state: stub(),
        get_favorites: stub(),
        get_channels: stub(),
        get_channel: stub(),
        get_channel_filters: stub(),
        get_now_playing: stub(),
    }
}

describe('The blocklet', function () {
    let client_stub: SinonStubbedInstance<IClient>

    beforeEach(function () {
        client_stub = create_client_stub()
    })

    it('should detect if the server is not alive', async function () {
        client_stub.is_alive.resolves(false)

        await expect(blocklet(client_stub as IClient)).to.eventually.deep.equal({
            full_text: 'not running',
            short_text: 'n/a',
            color: '#808080',
        })
    })

    it('should detect if the server is not playing anything', async function () {
        client_stub.is_alive.resolves(true)
        client_stub.get_playback_state.resolves(null)

        await expect(blocklet(client_stub as IClient)).to.eventually.deep.equal({
            full_text: 'paused',
            color: '#808080',
        })
    })

    it('should return the description', async function () {
        const state: PartialDeep<PlaybackStateDTO> = {
            channel: {
                name: 'The Channel',
            },
            now_playing: {
                artist: 'The Future Sequencer',
                title: 'Fade 2 Reality',
            },
        }

        client_stub.is_alive.resolves(true)
        client_stub.get_playback_state.resolves(state as PlaybackStateDTO)

        await expect(blocklet(client_stub as IClient)).to.eventually.deep.equal({
            color: '#ffffff',
            full_text: '[The Channel] The Future Sequencer - Fade 2 Reality',
            short_text: 'The Future Sequencer: Fade 2 Reality',
        })
    })
})
