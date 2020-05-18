import {ForbiddenException} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import {SinonStubbedInstance} from 'sinon'

import {FavoritesController} from '~src/application/controller'
import {CredentialsUnavailableError, IFavoritesProvider} from '~src/domain'

import {stub_favorites_provider, prebuilt_channel} from '~test/util'

const {progressive, vocaltrance} = prebuilt_channel

describe('Favorites controller', function () {
    let controller: FavoritesController
    let favorites_provider_stub: SinonStubbedInstance<IFavoritesProvider>

    beforeEach(async function () {
        favorites_provider_stub = stub_favorites_provider()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IFavoritesProvider',
                    useValue: favorites_provider_stub,
                },
                FavoritesController,
            ],
        }).compile()

        controller = module.get(FavoritesController)
    })

    it('should return the available favorites', async function () {
        favorites_provider_stub.get_all.resolves([progressive, vocaltrance])

        await expect(controller.list_favorites()).to.eventually.deep.equal([
            progressive.to_dto(),
            vocaltrance.to_dto(),
        ])
    })

    it('should throw if credentials are not available', async function () {
        favorites_provider_stub.get_all.throws(new CredentialsUnavailableError())

        await expect(controller.list_favorites()).to.be.rejectedWith(ForbiddenException)
    })

    it('should throw if an unexpected error occurred', async function () {
        const error = new Error()
        favorites_provider_stub.get_all.throws(error)

        await expect(controller.list_favorites()).to.be.rejectedWith(error)
    })
})
