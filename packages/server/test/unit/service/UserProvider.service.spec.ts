import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {UserProvider, IAppDataProvider} from '../../../src/service'
import {create_logger_stub, create_app_data_provider_stub, AppDataBuilder, UserBuilder} from '../../util'

describe('UserProvider service', function () {
    const user = new UserBuilder().build_premium()
    const app_data = new AppDataBuilder()
        .with_user(user)
        .build()

    let app_data_provider: SinonStubbedInstance<IAppDataProvider>
    let user_provider: UserProvider

    beforeEach(async function () {
        app_data_provider = create_app_data_provider_stub()
        app_data_provider.get_app_data.returns(app_data)

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: create_logger_stub(),
                },
                {
                    provide: 'IAppDataProvider',
                    useValue: app_data_provider,
                },
                UserProvider,
            ],
        }).compile()

        user_provider = module.get(UserProvider)
    })

    it('should return the user', function () {
        expect(user_provider.get_user()).to.equal(user)
    })
})
