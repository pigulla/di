import sinon, {SinonStubbedInstance} from 'sinon'

import {IAppDataProvider} from '~src/domain'

const {stub} = sinon

export function stub_app_data_provider(): SinonStubbedInstance<IAppDataProvider> {
    return {
        subscribe: stub(),
        get_app_data: stub(),
        last_updated_at: stub(),
    }
}
