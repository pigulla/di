import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import dayjs from 'dayjs'
import mockdate from 'mockdate'
import sinon, {SinonStubbedInstance} from 'sinon'

import {AppData} from '~src/domain/di'
import {DigitallyImported, AppDataProvider} from '~src/infrastructure/di'

import {stub_logger, stub_digitally_imported, AppDataBuilder} from '~test/util'

const {spy, stub} = sinon

describe('AppDataProvider', function () {
    let app_data_provider: AppDataProvider
    let di_stub: SinonStubbedInstance<DigitallyImported>

    beforeEach(async function () {
        const logger_stub = stub_logger()
        di_stub = stub_digitally_imported()
        logger_stub.child_for_service.returns(stub_logger())

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger_stub,
                },
                {
                    provide: 'IDigitallyImported',
                    useValue: di_stub,
                },
                AppDataProvider,
            ],
        }).compile()

        app_data_provider = module.get(AppDataProvider)
    })

    it('should load app data when the module is initialized', async function () {
        const load_app_data_stub = stub(app_data_provider, 'load_app_data')
        load_app_data_stub.resolves()

        await app_data_provider.onModuleInit()
        expect(app_data_provider.load_app_data).to.have.been.calledOnce
    })

    describe('when no app data has been loaded yet', function () {
        it('should throw if the last update time is accessed', function () {
            expect(() => app_data_provider.last_updated_at()).to.throw()
        })

        it('should throw if the app data is accessed', function () {
            expect(() => app_data_provider.get_app_data()).to.throw()
        })
    })

    describe('when app data has been loaded', function () {
        const now = dayjs('2019-10-09T18:44:19.179Z')
        let app_data: AppData

        beforeEach(async function () {
            mockdate.set(now.toDate())

            app_data = new AppDataBuilder().build()
            di_stub.load_app_data.resolves(app_data)

            await app_data_provider.load_app_data()
        })

        afterEach(function () {
            mockdate.reset()
        })

        it('should return the last update date', function () {
            expect(app_data_provider.last_updated_at().toISOString()).to.equal(now.toISOString())
        })

        it('should return the app data', function () {
            expect(app_data_provider.get_app_data()).to.equal(app_data)
        })

        it('should invoke registered callbacks', async function () {
            const observer = spy()
            app_data_provider.subscribe(observer)

            await app_data_provider.load_app_data()

            expect(observer).to.have.been.calledOnceWithExactly(app_data)
        })
    })
})
