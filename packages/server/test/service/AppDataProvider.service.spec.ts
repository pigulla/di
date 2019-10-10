import {spy, SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import dayjs from 'dayjs'
import mockdate from 'mockdate'

import {DigitallyImported, AppDataProvider} from '../../src/service'
import {create_logger_stub, create_digitally_imported_stub, AppDataBuilder, UserBuilder} from '../util'
import {AppData} from '../../src/service/di'

describe('AppDataProvider service', function () {
    let app_data_provider: AppDataProvider
    let di: SinonStubbedInstance<DigitallyImported>

    beforeEach(async function () {
        di = create_digitally_imported_stub()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: create_logger_stub(),
                },
                {
                    provide: 'IDigitallyImported',
                    useValue: di,
                },
                AppDataProvider,
            ],
        }).compile()

        app_data_provider = module.get(AppDataProvider)
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

            const user = new UserBuilder().build_guest()
            app_data = new AppDataBuilder().with_user(user).build()
            di.load_app_data.resolves(app_data)

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
            const cb = spy()

            app_data_provider.on_update(cb)
            await app_data_provider.load_app_data()

            expect(cb).to.have.been.calledOnceWithExactly(app_data)
        })
    })
})
