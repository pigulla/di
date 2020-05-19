import {expect} from 'chai'
import read_pkg_up from 'read-pkg-up'
import sinon, {SinonStub} from 'sinon'

import {Client} from '~src/Client'
import {ConfigurableClient} from '~src/ConfigurableClient'

const {stub} = sinon

describe('Client', function () {
    let read_pkg_up_sync: SinonStub

    beforeAll(function () {
        read_pkg_up_sync = stub(read_pkg_up, 'sync')
    })

    afterAll(function () {
        read_pkg_up_sync.restore()
    })

    beforeEach(function () {
        read_pkg_up_sync.reset()
    })

    it('should extend ConfigurableClient', function () {
        read_pkg_up_sync.returns({
            packageJson: {
                version: '1.0.3',
            },
        })
        const client = new Client()

        expect(client).to.be.instanceOf(ConfigurableClient)
    })

    it('should throw if the version is missing', function () {
        read_pkg_up_sync.returns(undefined)

        expect(() => new Client()).to.throw('Could not determine package version')
    })
})
