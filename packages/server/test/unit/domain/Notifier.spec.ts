import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {NextObserver} from 'rxjs'
import sinon, {SinonStubbedInstance} from 'sinon'

import {INotificationProvider, IPlaybackStateProvider, Notifier, PlaybackState} from '~src/domain'

import {
    stub_playback_state_provider,
    stub_notification_provider,
    prebuilt_channel,
} from '~test/util'

const {match} = sinon
const {progressive} = prebuilt_channel

describe('Notifier', function () {
    let notifier: Notifier
    let notification_provider_stub: SinonStubbedInstance<INotificationProvider>
    let playback_state_provider_stub: SinonStubbedInstance<IPlaybackStateProvider>

    beforeEach(async function () {
        notification_provider_stub = stub_notification_provider()
        playback_state_provider_stub = stub_playback_state_provider()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'INotificationProvider',
                    useValue: notification_provider_stub,
                },
                {
                    provide: 'IPlaybackStateProvider',
                    useValue: playback_state_provider_stub,
                },
                Notifier,
            ],
        }).compile()

        notifier = module.get(Notifier)
    })

    it('should notify on application startup', function () {
        notifier.onApplicationBootstrap()
        expect(notification_provider_stub.send).to.have.been.calledOnce
    })

    it('should notify on application shutdown', function () {
        notifier.onApplicationShutdown()
        expect(notification_provider_stub.send).to.have.been.calledOnce
    })

    describe('when the playback state has changed', function () {
        let observer: NextObserver<PlaybackState>['next']

        beforeEach(function () {
            expect(playback_state_provider_stub.subscribe).to.have.been.calledOnceWithExactly(
                match.func
            )
            observer = playback_state_provider_stub.subscribe.firstCall.lastArg
        })

        it('should send when stopped', function () {
            observer({stopped: true})

            expect(notification_provider_stub.send).to.have.been.calledOnceWithExactly(
                match.string,
                match('stopped')
            )
        })

        it('should send when started', function () {
            observer({
                stopped: false,
                channel: progressive,
                song: {
                    artist: 'The Future Sequencer',
                    title: 'Ocean Subfight',
                },
            })

            expect(notification_provider_stub.send).to.have.been.calledOnceWithExactly(
                match(progressive.name),
                match('The Future Sequencer')
            )
        })
    })
})
