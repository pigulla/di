import {Test} from '@nestjs/testing'
import {spy, SinonSpy, SinonStubbedInstance} from 'sinon'
import {expect} from 'chai'

import {
    IChannelsProvider,
    IOnAirProvider,
    IPlaybackControl,
    PLAYBACK_STATE_STOPPED,
    playback_states_differ,
    PlaybackStateProvider,
} from '@src/domain'
import {IOnAir} from '@src/domain/di'
import {
    create_on_air_provider_stub,
    create_playback_control_stub,
    create_logger_stub,
    create_channels_provider_stub,
    prebuilt_channel,
} from '@test/util'

const {progressive, vocaltrance} = prebuilt_channel

describe('playback_states_differ', function () {
    describe('when both are identical', function () {
        it('should return false for stopped states', function () {
            expect(playback_states_differ(
                {stopped: true},
                {stopped: true},
            )).to.be.false
        })

        it('should return false for non-stopped states', function () {
            expect(playback_states_differ(
                {
                    stopped: false,
                    channel: progressive,
                    song: {
                        artist: 'The Future Sequencer',
                        title: 'Chrome Ace',
                    },
                },
                {
                    stopped: false,
                    channel: progressive,
                    song: {
                        artist: 'The Future Sequencer',
                        title: 'Chrome Ace',
                    },
                },
            )).to.be.false
        })
    })

    describe('when the states differ', function () {
        it('should return true for different channels', function () {
            expect(playback_states_differ(
                {
                    stopped: false,
                    channel: vocaltrance,
                    song: {
                        artist: 'The Future Sequencer',
                        title: 'Chrome Ace',
                    },
                },
                {
                    stopped: false,
                    channel: progressive,
                    song: {
                        artist: 'The Future Sequencer',
                        title: 'Chrome Ace',
                    },
                },
            )).to.be.true
        })

        it('should return true for different states', function () {
            expect(playback_states_differ(
                {
                    stopped: false,
                    channel: vocaltrance,
                    song: {
                        artist: 'The Future Sequencer',
                        title: 'Chrome Ace',
                    },
                },
                {
                    stopped: true,
                },
            )).to.be.true
        })
    })
})

describe('PlaybackStateProvider', function () {
    let channels_provider_stub: SinonStubbedInstance<IChannelsProvider>
    let on_air_provider_stub: SinonStubbedInstance<IOnAirProvider>
    let playback_control_stub: SinonStubbedInstance<IPlaybackControl>
    let playback_state_provider: PlaybackStateProvider
    let on_change: SinonSpy

    beforeEach(async function () {
        const parent_logger_stub = create_logger_stub()
        parent_logger_stub.child_for_service.returns(create_logger_stub())

        channels_provider_stub = create_channels_provider_stub()
        on_air_provider_stub = create_on_air_provider_stub()
        playback_control_stub = create_playback_control_stub()

        on_change = spy()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: parent_logger_stub,
                },
                {
                    provide: 'IOnAirProvider',
                    useValue: on_air_provider_stub,
                },
                {
                    provide: 'IPlaybackControl',
                    useValue: playback_control_stub,
                },
                {
                    provide: 'IChannelsProvider',
                    useValue: channels_provider_stub,
                },
                PlaybackStateProvider,
            ],
        }).compile()

        playback_state_provider = module.get(PlaybackStateProvider)
        playback_state_provider.subscribe(on_change)
    })

    it('should be stopped by default', function () {
        expect(playback_state_provider.get_state()).to.equal(PLAYBACK_STATE_STOPPED)
    })

    describe('when playback is stopped', function () {
        beforeEach(async function () {
            playback_control_stub.is_playing.resolves(false)
            playback_control_stub.get_current_channel_key.resolves(null)
        })

        it('should not change state', async function () {
            await playback_state_provider.trigger_check()
            expect(on_change).not.to.have.been.called
        })

        it('should change state when playback has started', async function () {
            playback_control_stub.is_playing.resolves(true)
            playback_control_stub.get_current_channel_key.resolves(progressive.key)
            channels_provider_stub.get.withArgs(progressive.key).returns(progressive)
            on_air_provider_stub.get.withArgs(progressive.key).returns({
                channel_id: progressive.id,
                channel_key: progressive.key,
                artist: 'The Future Sequencer',
                title: 'Vary Time',
            } as IOnAir)

            await playback_state_provider.trigger_check()

            expect(on_change).to.have.been.calledOnceWithExactly({
                stopped: false,
                channel: progressive,
                song: {
                    artist: 'The Future Sequencer',
                    title: 'Vary Time',
                },
            })
        })
    })
})
