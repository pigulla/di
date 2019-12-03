import sinon, {SinonStubbedInstance} from 'sinon'

import {IFavoritesProvider} from '@server/service'

export function create_favorites_provider_stub (): SinonStubbedInstance<IFavoritesProvider> {
    return {
        get_all: sinon.stub(),
    }
}
