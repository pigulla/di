import {expect} from 'chai'
import http_mocks from 'node-mocks-http'
import {NormalizedPackageJson} from 'read-pkg'
import {spy} from 'sinon'

import {AppVersionHeader} from '@src/middleware'

describe('The app version header middleware', function () {
    const name = 'MyApp'
    const version = '1.0.42'
    const package_json: NormalizedPackageJson = {name, version} as NormalizedPackageJson
    let app_version_header_middleware: AppVersionHeader

    beforeEach(function () {
        app_version_header_middleware = new AppVersionHeader(package_json)
    })

    it('should set the header and call next', function () {
        const next = spy()
        const {req, res} = http_mocks.createMocks()

        app_version_header_middleware.use(req, res, next)

        expect(next).to.have.been.calledOnceWithExactly()
        expect(res.getHeader(AppVersionHeader.HEADER_NAME)).to.equal(`${name} ${version}`)
    })
})
