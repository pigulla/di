import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {NotFoundException} from '@nestjs/common'
import {expect} from 'chai'

import {PlaybackController} from '@server/controller'
import {IChannelProvider, IConfigProvider, INowPlayingProvider, IPlaybackControl} from '@server/service'
import {Quality} from '@server/service/di'

import {
    ChannelBuilder,
    create_channel_provider_stub,
    create_config_provider_stub,
    create_now_playing_provider_stub,
    create_playback_control_stub,
    prebuilt_channel, NowPlayingBuilder,
} from '../../util'

describe('Playback controller', function () {
    let controller: PlaybackController
    let playback_control_stub: SinonStubbedInstance<IPlaybackControl>
    let channel_provider_stub: SinonStubbedInstance<IChannelProvider>
    let config_provider_stub: SinonStubbedInstance<IConfigProvider>
    let now_playing_provider_stub: SinonStubbedInstance<INowPlayingProvider>

    beforeEach(async function () {
        playback_control_stub = create_playback_control_stub()
        channel_provider_stub = create_channel_provider_stub()
        now_playing_provider_stub = create_now_playing_provider_stub()
        config_provider_stub = create_config_provider_stub({
            di_listenkey: 'my-listen-key',
            di_quality: Quality.MP3_320,
        })

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IPlaybackControl',
                    useValue: playback_control_stub,
                },
                {
                    provide: 'IChannelProvider',
                    useValue: channel_provider_stub,
                },
                {
                    provide: 'IConfigProvider',
                    useValue: config_provider_stub,
                },
                {
                    provide: 'INowPlayingProvider',
                    useValue: now_playing_provider_stub,
                },
                PlaybackController,
            ],
        }).compile()

        controller = module.get(PlaybackController)
    })

    describe('when the current state is queried', function () {
        const {progressive} = prebuilt_channel

        it('should return empty data if nothing is playing', async function () {
            playback_control_stub.is_playing.resolves(false)
            playback_control_stub.get_channel_key.resolves(progressive.key)

            await expect(controller.current()).to.eventually.deep.equal({
                now_playing: false,
                channel: null,
            })
        })

        it('should return empty data if no channel is set', async function () {
            playback_control_stub.is_playing.resolves(true)
            playback_control_stub.get_channel_key.resolves(null)

            await expect(controller.current()).to.eventually.deep.equal({
                now_playing: false,
                channel: null,
            })
        })

        it('should return the data if something is playing', async function () {
            playback_control_stub.is_playing.resolves(true)
            playback_control_stub.get_channel_key.resolves(progressive.key)

            const now_playing = new NowPlayingBuilder()
                .for_channel(progressive)
                .with_display_artist('Hairy Potter')
                .with_display_title('Hookwarts')
                .build()
            channel_provider_stub.get_by_key.withArgs(progressive.key).returns(progressive)
            now_playing_provider_stub.get_by_channel_key.withArgs(progressive.key).returns(now_playing)

            await expect(controller.current()).to.eventually.deep.equal({
                channel: progressive.to_dto(),
                now_playing: {
                    artist: now_playing.display_artist,
                    title: now_playing.display_title,
                },
            })
        })
    })

    describe('when checked if playback is active', function () {
        it('should succeed when playing', async function () {
            playback_control_stub.is_playing.resolves(true)

            await expect(controller.is_playing()).to.eventually.be.undefined
        })

        it('should fail when not playing', async function () {
            playback_control_stub.is_playing.resolves(false)

            await expect(controller.is_playing()).to.eventually.be.rejectedWith(NotFoundException)
        })
    })

    describe('when playback is stopped', function () {
        it('should work', async function () {
            playback_control_stub.stop.resolves()

            await expect(controller.stop()).to.eventually.be.undefined
        })
    })

    describe('when playback is started', function () {
        it('should work if the channel exists', async function () {
            const channel = new ChannelBuilder().with_key('progressive').build()

            channel_provider_stub.channel_exists.withArgs('progressive').returns(true)
            channel_provider_stub.get_by_key.withArgs('progressive').returns(channel)

            await expect(controller.play({channel: 'progressive'})).to.eventually.deep.equal(channel.to_dto())
            expect(playback_control_stub.play)
                .to.have.been.calledOnceWithExactly(channel.build_url('my-listen-key', Quality.MP3_320))
        })

        it('should fail if the channel does not exist', async function () {
            channel_provider_stub.channel_exists.withArgs('progressive').returns(false)

            await expect(controller.play({channel: 'progressive'}))
                .to.eventually.be.rejectedWith(NotFoundException)
        })
    })
})