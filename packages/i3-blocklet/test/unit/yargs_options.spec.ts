import 'chai-as-promised'
import 'sinon-chai'
import {expect} from 'chai'

import {yargs_options} from '~src/yargs_options'

describe('yargs_options', function () {
    describe('should validate the endpoint option', function () {
        const coerce = yargs_options.endpoint.coerce!

        it('and succeed for a correct URL', function () {
            expect(coerce('http://di.local/foo')).to.equal('http://di.local/foo')
        })

        it('and fail for an invalid URL', function () {
            expect(() => coerce('💩')).to.throw('Endpoint is not a valid URL')
        })

        it('and fail for an invalid protocol', function () {
            expect(() => coerce('ftp://di.local')).to.throw('Endpoint must be http or https')
        })
    })
})
