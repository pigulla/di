import nock, {Scope} from 'nock'
import {EndpointBuilder} from './Endpoint.builder'

export class HomepageEndpointBuilder extends EndpointBuilder {
    public build (): Scope {
        const response = this.load_response('homepage')

        return nock(this.base_url)
            .get('/')
            .reply(200, response)
    }
}
