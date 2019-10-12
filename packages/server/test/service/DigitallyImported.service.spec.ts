import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {IConfigProvider, DigitallyImported} from '../../src/service'
import {
    create_logger_stub,
    create_config_provider_stub, HomepageEndpointBuilder,
} from '../util'
import {AuthenticationError, PremiumUser, User, UserType} from '../../src/service/di'
import {LoginEndpointBuilder} from '../util/builder'

describe('DigitallyImported service', function () {
    const username = 'hairy_potter@n3rd.org'
    const password = 'secret'

    let config_provider: SinonStubbedInstance<IConfigProvider>
    let digitally_imported: DigitallyImported

    describe('with configured credentials', function () {
        beforeEach(async function () {
            config_provider = create_config_provider_stub({
                di_url: 'https://di.fm.invalid',
                di_username: username,
                di_password: password,
            })

            const module = await Test.createTestingModule({
                providers: [
                    {
                        provide: 'ILogger',
                        useValue: create_logger_stub(),
                    },
                    {
                        provide: 'IConfigProvider',
                        useValue: config_provider,
                    },
                    DigitallyImported,
                ],
            }).compile()

            digitally_imported = module.get(DigitallyImported)
        })

        it('should throw on login failure', async function () {
            new LoginEndpointBuilder()
                .for_base_url(config_provider.di_url)
                .for_username(username)
                .for_password(password)
                .with_failure()
                .build()

            return expect(digitally_imported.load_app_data()).to.eventually.rejectedWith(AuthenticationError)
        })

        it('should return the user', async function () {
            const expected = {
                audio_token: '00112233445566778899aabbccddeeff',
                session_key: '0123456789abcdef0123456789abcdef',
                id: 123456,
                api_key: '000102030405060708090a0b0c0d0e0f',
                listen_key: 'fedcba9876543210',
            }

            new LoginEndpointBuilder()
                .for_base_url(config_provider.di_url)
                .for_username(username)
                .for_password(password)
                .with_success()
                .build()

            const app_data = await digitally_imported.load_app_data()
            expect(app_data.user).to.be.an.instanceOf(User)
            expect(app_data.user.type).to.equal(UserType.PREMIUM)

            const user: PremiumUser = app_data.user as PremiumUser
            expect(user.audio_token).to.equal(expected.audio_token)
            expect(user.api_key).to.equal(expected.api_key)
            expect(user.session_key).to.equal(expected.session_key)
            expect(user.listen_key).to.equal(expected.listen_key)
        })
    })

    describe('with no configured credentials', function () {
        beforeEach(async function () {
            config_provider = create_config_provider_stub({
                di_url: 'https://di.fm.invalid',
                di_listenkey: '1234567890abcdef',
            })

            const module = await Test.createTestingModule({
                providers: [
                    {
                        provide: 'ILogger',
                        useValue: create_logger_stub(),
                    },
                    {
                        provide: 'IConfigProvider',
                        useValue: config_provider,
                    },
                    DigitallyImported,
                ],
            }).compile()

            digitally_imported = module.get(DigitallyImported)
        })

        it('should return a guest', async function () {
            new HomepageEndpointBuilder()
                .for_base_url(config_provider.di_url)
                .build()

            const app_data = await digitally_imported.load_app_data()
            expect(app_data.user).to.be.an.instanceOf(User)
            expect(app_data.user.type).to.equal(UserType.GUEST)
        })
    })
})
