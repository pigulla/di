import {expect} from 'chai'
import sinon, {stub, SinonStubbedInstance, SinonFakeTimers, SinonStub} from 'sinon'
import {IClient} from '@digitally-imported/client'

import {start_poll} from '@src/start_poll'

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

describe('The start_poll function', function () {
    let clock: SinonFakeTimers
    let client_stub: SinonStubbedInstance<IClient>
    let notify_stub: SinonStub

    beforeEach(function () {
        clock = sinon.useFakeTimers()
        client_stub = create_client_stub()
        notify_stub = stub()
    })

    afterEach(function () {
        clock.restore()
    })

    it('should detect if the server is not running', async function () {
        client_stub.is_alive.resolves(false)

        await start_poll(client_stub as IClient, 100, notify_stub)

        expect(notify_stub).to.have.been.calledOnceWithExactly({
            title: 'Digitally Imported',
            message: 'Server not running',
        })
    })

    it('should detect if no song is playing', function () {
        client_stub.is_alive.resolves(true)
        client_stub.get_playback_state.resolves(null)

        start_poll(client_stub as IClient, 100, notify_stub)

        clock.next()

        expect(notify_stub).to.have.been.calledOnceWithExactly({
            title: 'Digitally Imported',
            message: 'Playback stopped',
        })
    })

    it('should detect if a song is playing', function () {
        client_stub.is_alive.resolves(true)
        client_stub.get_playback_state.resolves({
            channel: {
                director: 'Hairy Potter',
                description: 'The most awesomest music',
                id: 42,
                key: 'most-awesome',
                name: 'Most Awesome',
                updated_at: null,
                created_at: '2019-12-08T19:46:47.994Z',
                images: {
                    default: 'http://images.local/most-awesome.jpg',
                    compact: 'http://images.local/most-awesome-comapct.jpg',
                    banner: null,
                },
            },
            now_playing: {
                artist: 'The Future Sequencer',
                title: 'Mission One',
            },
        })

        start_poll(client_stub as IClient, 100, notify_stub)

        expect(notify_stub).to.have.been.calledOnceWithExactly({
            title: 'Digitally Imported: Most Awesome',
            message: 'The Future Sequencer - Mission One',
        })
    })

    it('should clear the timer when stopped', function () {
        client_stub.is_alive.resolves(true)
        client_stub.get_playback_state.resolves(null)

        const stop_fn = start_poll(client_stub as IClient, 100, notify_stub)
        expect(clock.countTimers()).to.equal(1)

        stop_fn()
        expect(clock.countTimers()).to.equal(0)
    })

    it('should do nothing when stopped twice', function () {
        client_stub.is_alive.resolves(true)
        client_stub.get_playback_state.resolves(null)

        const stop_fn = start_poll(client_stub as IClient, 100, notify_stub)

        stop_fn()
        stop_fn()
        expect(clock.countTimers()).to.equal(0)
    })
})
