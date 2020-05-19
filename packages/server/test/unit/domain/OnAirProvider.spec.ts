import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {IDigitallyImported, OnAirProvider} from '~src/domain'
import {IOnAir} from '~src/domain/di'

import {stub_digitally_imported, stub_logger, NowPlayingBuilder, prebuilt_channel} from '~test/util'

const {progressive, vocaltrance, classictechno} = prebuilt_channel

describe('OnAirProvider', function () {
    let on_air_provider: OnAirProvider
    let digitally_imported_stub: SinonStubbedInstance<IDigitallyImported>

    beforeEach(async function () {
        const logger_stub = stub_logger()
        logger_stub.child_for_service.returns(stub_logger())
        digitally_imported_stub = stub_digitally_imported()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    provide: 'IDigitallyImported',
                    useValue: digitally_imported_stub,
                },
                OnAirProvider,
            ],
        }).compile()

        on_air_provider = module.get(OnAirProvider)
    })

    it('should be empty by default', function () {
        expect(on_air_provider.get_all()).to.have.length(0)
    })

    describe('when updated', function () {
        let on_air_items: IOnAir[]

        beforeEach(async function () {
            on_air_items = [
                new NowPlayingBuilder().for_channel(progressive).build(),
                new NowPlayingBuilder().for_channel(vocaltrance).build(),
            ]

            digitally_imported_stub.load_on_air.resolves(on_air_items)
            await on_air_provider.trigger_update()
        })

        it('should return the data', function () {
            expect(on_air_provider.get_all()).to.have.same.members(on_air_items)
        })

        it('should return the channels by general getter', function () {
            expect(on_air_provider.get(progressive.key)).to.equal(on_air_items[0])
            expect(() => on_air_provider.get(classictechno.key)).to.throw()
        })

        it('should return the channels by id', function () {
            expect(on_air_provider.get_by_channel_id(progressive.id)).to.equal(on_air_items[0])
            expect(() => on_air_provider.get(classictechno.id)).to.throw()
        })

        it('should return the channels by key', function () {
            expect(on_air_provider.get_by_channel_key(progressive.key)).to.equal(on_air_items[0])
            expect(() => on_air_provider.get(classictechno.key)).to.throw()
        })
    })
})
