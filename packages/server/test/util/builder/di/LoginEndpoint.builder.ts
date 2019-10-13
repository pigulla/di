import nock, {Scope} from 'nock'
import {EndpointBuilder} from './Endpoint.builder'

export class LoginEndpointBuilder extends EndpointBuilder {
    private success: boolean = true
    private username: string = 'user@name.test'
    private password: string = 'password'

    public for_username (username: string): this {
        this.username = username
        return this
    }

    public for_password (password: string): this {
        this.password = password
        return this
    }

    public with_success (): this {
        this.success = true
        return this
    }

    public with_failure (): this {
        this.success = false
        return this
    }

    public build (): Scope {
        const response = this.load_response(this.success ? 'login.success' : 'login.failure')

        return nock(this.base_url)
            .post('/login', {
                'member_session[username]': this.username,
                'member_session[password]': this.password,
                'member_session[remember_me]': 0,
            })
            .reply(200, response)
    }
}
