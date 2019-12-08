import {NotFoundException} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {NowPlayingController} from '@src/controller'
import {INowPlayingProvider} from '@src/service'

import {
    create_now_playing_provider_stub,
    prebuilt_channel, NowPlayingBuilder,
} from '@test/util'

describe('NowPlaying controller', function () {
    let controller: NowPlayingController
    let now_playing_provider_stub: SinonStubbedInstance<INowPlayingProvider>

    beforeEach(async function () {
        now_playing_provider_stub = create_now_playing_provider_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'INowPlayingProvider',
                    useValue: now_playing_provider_stub,
                },
                NowPlayingController,
            ],
        }).compile()

        controller = module.get(NowPlayingController)
    })

    it('should return all currently playing songs', function () {
        const now_playing = [
            new NowPlayingBuilder().for_channel(prebuilt_channel.progressive).build(),
            new NowPlayingBuilder().for_channel(prebuilt_channel.vocaltrance).build(),
        ]
        now_playing_provider_stub.get_all.returns(now_playing)

        const result = controller.now_playing()
        expect(result).to.deep.equal(now_playing.map(item => item.to_dto()))
    })

    it('should return the currently playing song for a channel', async function () {
        const channel = prebuilt_channel.progressive
        const now_playing = new NowPlayingBuilder().for_channel(channel).build()

        now_playing_provider_stub.get_by_channel_key.withArgs(channel.key).returns(now_playing)

        const result = await controller.now_playing_on_channel(channel.key)
        expect(result).to.deep.equal(now_playing.to_dto())
    })

    it('should throw if the channel does not exist', async function () {
        const error = new Error()

        now_playing_provider_stub.get_by_channel_key.withArgs('invalid').throws(error)

        expect(() => controller.now_playing_on_channel('invalid')).to.throw(NotFoundException)
    })
})
