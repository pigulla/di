import {expect} from 'chai'

import {
    AuthenticationFailureError,
    FailedAuthenticationResponse,
    parse_authentication_response, RawFailedAuthenticationResponse,
    RawSuccessfulAuthenticationResponse,
    SuccessfulAuthenticationResponse,
} from '@src/infrastructure/di'

describe('The AuthenticationResponse', function () {
    it('should be parsed when authentication was successful', function () {
        const response: RawSuccessfulAuthenticationResponse & { [key: string]: any } = {
            auth: true,
            confirmed: true,
            premium_subscriber: true,
            listen_key: 'listen-key',
            first_name: 'Hairy',
            last_name: 'Potter',
            email: 'hairy@potter.local',
            return_to_url: null,
        }
        const parsed = parse_authentication_response(response)

        expect(parsed).to.be.instanceOf(SuccessfulAuthenticationResponse)
        expect(parsed).to.deep.equal({
            auth: true,
            confirmed: true,
            premium_subscriber: true,
            listen_key: 'listen-key',
            first_name: 'Hairy',
            last_name: 'Potter',
            email: 'hairy@potter.local',
            return_to_url: null,
        })
    })

    it('should be parsed when authentication failed', function () {
        const response: RawFailedAuthenticationResponse & { [key: string]: any } = {
            auth: false,
            errors: ['boom!', 'bam'],
        }
        const parsed = parse_authentication_response(response)

        expect(parsed).to.be.instanceOf(FailedAuthenticationResponse)
        expect(parsed).to.deep.equal({
            auth: false,
            errors: ['boom!', 'bam'],
        })
    })

    it('should be used in an AuthenticationFailureError', function () {
        const failed_response = new FailedAuthenticationResponse(false, ['boom', 'bam'])
        const error = new AuthenticationFailureError(failed_response)

        expect(error).to.be.instanceOf(Error)
        expect(error.errors).to.deep.equal(failed_response.errors)
    })
})
