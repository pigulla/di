import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {
    create_vlc_control_stub,
    create_channel_provider_stub,
    create_listen_key_provider_stub, ChannelBuilder, TrackInfoBuilder,
} from '../../util'
import {PlaybackController} from '../../../src/controller'
import {IChannelProvider, IListenKeyProvider, IVlcControl} from '../../../src/service'
import {InternalServerErrorException, NotFoundException} from '@nestjs/common'

describe('Playback controller', function () {
    let controller: PlaybackController
    let vlc_control_stub: SinonStubbedInstance<IVlcControl>
    let channel_provider_stub: SinonStubbedInstance<IChannelProvider>
    let listen_key_provider_stub: SinonStubbedInstance<IListenKeyProvider>

    beforeEach(async function () {
        vlc_control_stub = create_vlc_control_stub()
        channel_provider_stub = create_channel_provider_stub()
        listen_key_provider_stub = create_listen_key_provider_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IVlcControl',
                    useValue: vlc_control_stub,
                },
                {
                    provide: 'IChannelProvider',
                    useValue: channel_provider_stub,
                },
                {
                    provide: 'IListenKeyProvider',
                    useValue: listen_key_provider_stub,
                },
                PlaybackController,
            ],
        }).compile()

        controller = module.get(PlaybackController)
    })

    describe('when the current state is queried', function () {
        beforeEach(function () {
            vlc_control_stub.get_volume.resolves(0.77)
        })

        it('should succeed if nothing is playing', async function () {
            vlc_control_stub.info.resolves(null)

            await expect(controller.current()).to.eventually.deep.equal({
                now_playing: false,
                channel: null,
                volume: 0.77,
            })
        })

        it('should succeed if something is playing', async function () {
            const channel = ChannelBuilder.build_progressive()
            const track_info = new TrackInfoBuilder()
                .with_now_playing('Hairy Potter - Hookwarts')
                .with_filename(`http://www.di.fm.local/stream?${channel.key}`)
                .build()
            vlc_control_stub.info.resolves(track_info)
            channel_provider_stub.get_channel_by_key.withArgs(channel.key).returns(channel)

            await expect(controller.current()).to.eventually.deep.equal({
                now_playing: 'Hairy Potter - Hookwarts',
                channel: channel.to_dto(),
                volume: 0.77,
            })
        })

        it('should fail if the filename reported by VLC is invalid', async function () {
            const track_info = new TrackInfoBuilder()
                .with_now_playing('Hairy Potter - Hookwarts')
                .with_filename('invalid')
                .build()
            vlc_control_stub.info.resolves(track_info)

            await expect(controller.current()).to.eventually.be.rejectedWith(InternalServerErrorException)
        })
    })

    describe('when checked if playback is active', function () {
        it('should succeed when playing', async function () {
            vlc_control_stub.is_playing.resolves(true)

            await expect(controller.is_playing()).to.eventually.be.undefined
        })

        it('should fail when not playing', async function () {
            vlc_control_stub.is_playing.resolves(false)

            await expect(controller.is_playing()).to.eventually.be.rejectedWith(NotFoundException)
        })
    })

    describe('when playback is stopped', function () {
        it('should work', async function () {
            vlc_control_stub.stop.resolves()

            await expect(controller.stop()).to.eventually.be.undefined
        })
    })

    describe('when playback is started', function () {
        it('should work if the channel exists', async function () {
            const channel = new ChannelBuilder().with_key('progressive').build()

            listen_key_provider_stub.get_listen_key.returns('my-listen-key')
            channel_provider_stub.channel_exists.withArgs('progressive').returns(true)
            channel_provider_stub.get_channel_by_key.withArgs('progressive').returns(channel)

            await expect(controller.play({channel: 'progressive'})).to.eventually.deep.equal(channel.to_dto())
            expect(vlc_control_stub.add).to.have.been.calledOnceWithExactly(channel.build_url('my-listen-key'))
        })

        it('should fail if the channel does not exist', async function () {
            channel_provider_stub.channel_exists.withArgs('progressive').returns(false)

            await expect(controller.play({channel: 'progressive'})).to.eventually.be.rejectedWith(NotFoundException)
        })
    })
})
