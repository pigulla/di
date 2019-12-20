import {NotFoundException} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {OnAirController} from '@src/application/controller'
import {IOnAirProvider} from '@src/domain'

import {
    create_on_air_provider_stub,
    prebuilt_channel, NowPlayingBuilder,
} from '@test/util'

describe('NowPlaying controller', function () {
    let controller: OnAirController
    let on_air_provider_stub: SinonStubbedInstance<IOnAirProvider>

    beforeEach(async function () {
        on_air_provider_stub = create_on_air_provider_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IOnAirProvider',
                    useValue: on_air_provider_stub,
                },
                OnAirController,
            ],
        }).compile()

        controller = module.get(OnAirController)
    })

    it('should return all currently playing songs', function () {
        const now_playing = [
            new NowPlayingBuilder().for_channel(prebuilt_channel.progressive).build(),
            new NowPlayingBuilder().for_channel(prebuilt_channel.vocaltrance).build(),
        ]
        on_air_provider_stub.get_all.returns(now_playing)

        const result = controller.now_playing()
        expect(result).to.deep.equal(now_playing.map(item => item.to_dto()))
    })

    it('should return the currently playing song for a channel', async function () {
        const channel = prebuilt_channel.progressive
        const now_playing = new NowPlayingBuilder().for_channel(channel).build()

        on_air_provider_stub.get_by_channel_key.withArgs(channel.key).returns(now_playing)

        const result = await controller.now_playing_on_channel(channel.key)
        expect(result).to.deep.equal(now_playing.to_dto())
    })

    it('should throw if the channel does not exist', async function () {
        const error = new Error()

        on_air_provider_stub.get_by_channel_key.withArgs('invalid').throws(error)

        expect(() => controller.now_playing_on_channel('invalid')).to.throw(NotFoundException)
    })
})
