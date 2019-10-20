import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {NowPlayingProvider} from '@server/service'
import {NowPlaying} from '@server/service/di'

import {create_logger_stub, NowPlayingBuilder, prebuilt_channel} from '../../util'

const {progressive, vocaltrance, classictechno} = prebuilt_channel

describe('NowPlayingProvider service', function () {
    let now_playing_provider: NowPlayingProvider

    beforeEach(async function () {
        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: create_logger_stub(),
                },
                NowPlayingProvider,
            ],
        }).compile()

        now_playing_provider = module.get(NowPlayingProvider)
    })

    it('should be empty by default', function () {
        expect(now_playing_provider.get_all()).to.have.length(0)
    })

    describe('when updated', function () {
        let now_playing_items: NowPlaying[]

        beforeEach(function () {
            now_playing_items = [
                new NowPlayingBuilder().for_channel(progressive).build(),
                new NowPlayingBuilder().for_channel(vocaltrance).build(),
            ]

            now_playing_provider.update(now_playing_items)
        })

        it('should return the data', function () {
            expect(now_playing_provider.get_all()).to.have.same.members(now_playing_items)
        })

        it('should return the channels by general getter', function () {
            expect(now_playing_provider.get(progressive)).to.equal(now_playing_items[0])
            expect(() => now_playing_provider.get(classictechno)).to.throw()
        })

        it('should return the channels by id', function () {
            expect(now_playing_provider.get_by_channel_id(progressive.id)).to.equal(now_playing_items[0])
            expect(() => now_playing_provider.get_by_channel_id(classictechno.id)).to.throw()
        })

        it('should return the channels by key', function () {
            expect(now_playing_provider.get_by_channel_key(progressive.key)).to.equal(now_playing_items[0])
            expect(() => now_playing_provider.get_by_channel_key(classictechno.key)).to.throw()
        })
    })
})
