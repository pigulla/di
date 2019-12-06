import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {
    IDigitallyImported,
    IConfigProvider,
    IChannelsProvider,
    FavoritesProvider,
    CredentialsUnavailableError,
} from '@server/service'

import {
    create_logger_stub,
    create_channels_provider_stub,
    create_config_provider_stub,
    create_digitally_imported_stub,
    prebuilt_channel,
} from '@test/util'

const {progressive, classictechno} = prebuilt_channel

describe('FavoritesProvider service', function () {
    let favorites_provider: FavoritesProvider
    let config_provider: SinonStubbedInstance<IConfigProvider>
    let channels_provider: SinonStubbedInstance<IChannelsProvider>
    let digitally_imported: SinonStubbedInstance<IDigitallyImported>

    beforeEach(async function () {
        const logger = create_logger_stub()
        config_provider = create_config_provider_stub()
        channels_provider = create_channels_provider_stub()
        digitally_imported = create_digitally_imported_stub()

        logger.child_for_service.returns(create_logger_stub())

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'ILogger',
                    useValue: logger,
                },
                {
                    provide: 'IChannelsProvider',
                    useValue: channels_provider,
                },
                {
                    provide: 'IConfigProvider',
                    useValue: config_provider,
                },
                {
                    provide: 'IDigitallyImported',
                    useValue: digitally_imported,
                },
                FavoritesProvider,
            ],
        }).compile()

        favorites_provider = module.get(FavoritesProvider)
    })

    it('should return all favorites if credentials are given', async function () {
        channels_provider.get.withArgs(progressive.key).returns(progressive)
        channels_provider.get.withArgs(classictechno.key).returns(classictechno)

        digitally_imported.load_favorite_channel_keys
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .withArgs(config_provider.di_credentials!)
            .resolves([progressive.key, classictechno.key])

        const favorites = await favorites_provider.get_all()

        expect(favorites).to.deep.equal([progressive, classictechno])
    })

    it('should throw if no credentials are given', async function () {
        config_provider.di_credentials = null

        await expect(favorites_provider.get_all()).to.be.rejectedWith(CredentialsUnavailableError)
    })
})
