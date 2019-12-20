import {NotFoundException} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {PlaybackController} from '@src/application/controller'
import {Configuration, IChannelsProvider, IOnAirProvider, IPlaybackControl} from '@src/domain'
import {Quality} from '@src/domain/di'

import {
    ChannelBuilder,
    create_channels_provider_stub,
    create_config_stub,
    create_on_air_provider_stub,
    create_playback_control_stub,
    prebuilt_channel, NowPlayingBuilder,
} from '../../../util'

describe('Playback controller', function () {
    let controller: PlaybackController
    let playback_control_stub: SinonStubbedInstance<IPlaybackControl>
    let channels_provider_stub: SinonStubbedInstance<IChannelsProvider>
    let config_stub: SinonStubbedInstance<Configuration>
    let on_air_provider_stub: SinonStubbedInstance<IOnAirProvider>

    beforeEach(async function () {
        playback_control_stub = create_playback_control_stub()
        channels_provider_stub = create_channels_provider_stub()
        on_air_provider_stub = create_on_air_provider_stub()
        config_stub = create_config_stub({
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
                    provide: 'IChannelsProvider',
                    useValue: channels_provider_stub,
                },
                {
                    provide: 'configuration',
                    useValue: config_stub,
                },
                {
                    provide: 'IOnAirProvider',
                    useValue: on_air_provider_stub,
                },
                PlaybackController,
            ],
        }).compile()

        controller = module.get(PlaybackController)
    })

    describe('when the current state is queried', function () {
        const {progressive} = prebuilt_channel

        it('should return empty data if nothing is playing', async function () {
            playback_control_stub.get_current_channel_key.resolves(null)

            await expect(controller.current()).to.be.rejectedWith(NotFoundException)
        })

        it('should return the data if something is playing', async function () {
            playback_control_stub.get_current_channel_key.resolves(progressive.key)

            const now_playing = new NowPlayingBuilder()
                .for_channel(progressive)
                .with_display_artist('Hairy Potter')
                .with_display_title('Hookwarts')
                .build()
            on_air_provider_stub.get_by_channel_key.withArgs(progressive.key).returns(now_playing)
            channels_provider_stub.get.withArgs(progressive.key).returns(progressive)

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

            await expect(controller.is_playing()).to.be.rejectedWith(NotFoundException)
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

            channels_provider_stub.channel_exists.withArgs('progressive').returns(true)
            channels_provider_stub.get.withArgs('progressive').returns(channel)

            await expect(controller.play({channel: 'progressive'})).to.eventually.deep.equal(channel.to_dto())
            expect(playback_control_stub.play)
                .to.have.been.calledOnceWithExactly(channel.build_url('my-listen-key', Quality.MP3_320))
        })

        it('should fail if the channel does not exist', async function () {
            channels_provider_stub.channel_exists.withArgs('progressive').returns(false)

            await expect(controller.play({channel: 'progressive'}))
                .to.be.rejectedWith(NotFoundException)
        })
    })
})
