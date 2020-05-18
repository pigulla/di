import sinon, {SinonStubbedInstance} from 'sinon'

import {IFavoritesProvider} from '~src/domain'

const {stub} = sinon

export function stub_favorites_provider(): SinonStubbedInstance<IFavoritesProvider> {
    return {
        get_all: stub(),
    }
}
