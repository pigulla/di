import sinon, {SinonStubbedInstance} from 'sinon'

import {IAppDataProvider} from '@src/domain'

export function create_app_data_provider_stub (): SinonStubbedInstance<IAppDataProvider> {
    return {
        subscribe: sinon.stub(),
        get_app_data: sinon.stub(),
        last_updated_at: sinon.stub(),
    }
}
