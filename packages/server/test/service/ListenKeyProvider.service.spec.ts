import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {IAppDataProvider, ListenKeyProvider} from '../../src/service'
import {create_logger_stub, create_config_provider_stub, create_app_data_provider_stub, AppDataBuilder, UserBuilder, ConfigOverrides} from '../util'
import {User} from '../../src/service/di'

describe('ListenKeyProvider service', function () {
    let app_data_provider: SinonStubbedInstance<IAppDataProvider>
    let listenkey_provider: ListenKeyProvider

    async function get_provider (user: User, config_overrides: ConfigOverrides): Promise<ListenKeyProvider> {
        const app_data = new AppDataBuilder()
            .with_user(user)
            .build()

        app_data_provider = create_app_data_provider_stub()
        app_data_provider.get_app_data.returns(app_data)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: create_logger_stub(),
                },
                {
                    provide: 'IConfigProvider',
                    useValue: create_config_provider_stub(config_overrides),
                },
                {
                    provide: 'IAppDataProvider',
                    useValue: app_data_provider,
                },
                ListenKeyProvider,
            ],
        }).compile()

        return module.get(ListenKeyProvider)
    }

    describe('when credentials are given', function () {
        beforeEach(async function () {
            const user = new UserBuilder()
                .with_listen_key('0123456789abcdef')
                .build_premium()

            listenkey_provider = await get_provider(user, {
                digitally_imported: {
                    listen_key: null,
                },
            })
        })

        it('should return the listen key', function () {
            expect(listenkey_provider.get_listen_key()).to.equal('0123456789abcdef')
        })
    })

    describe('when the listenkey is explicitly provided', function () {
        beforeEach(async function () {
            const user = new UserBuilder().build_guest()

            listenkey_provider = await get_provider(user, {
                digitally_imported: {
                    listen_key: '0011223344556677',
                },
            })
        })

        it('should return the listen key', function () {
            expect(listenkey_provider.get_listen_key()).to.equal('0011223344556677')
        })
    })

    describe('when no key is available', function () {
        beforeEach(async function () {
            const user = new UserBuilder().build_guest()

            listenkey_provider = await get_provider(user, {
                digitally_imported: {
                    listen_key: null,
                },
            })
        })

        it('should throw', function () {
            expect(() => listenkey_provider.get_listen_key()).to.throw()
        })
    })
})
