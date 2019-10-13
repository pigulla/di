import sinon, {SinonStubbedInstance} from 'sinon'

import {IUserProvider} from '../../../src/service'

export function create_user_provider_stub (): SinonStubbedInstance<IUserProvider> {
    return {
        get_user: sinon.stub(),
    }
}
