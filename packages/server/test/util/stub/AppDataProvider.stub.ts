import sinon, {SinonStubbedInstance} from 'sinon'

import {IAppDataProvider} from '../../../src/service'

export function create_app_data_provider_stub (): SinonStubbedInstance<IAppDataProvider> {
    return {
        on_update: sinon.stub(),
        load_app_data: sinon.stub(),
        get_app_data: sinon.stub(),
        last_updated_at: sinon.stub(),
    }
}
