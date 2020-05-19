import {HttpStatus} from '@nestjs/common'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'
import dayjs from 'dayjs'
import {mockResponse} from 'mock-req-res'
import {NormalizedPackageJson} from 'read-pkg-up'
import {SinonStubbedInstance} from 'sinon'
import {JsonObject} from 'type-fest'

import {ServerController} from '~src/application/controller'
import {IAppDataProvider, IPlaybackControl, IServerProcessProxy} from '~src/domain'

import {
    AppDataBuilder,
    stub_app_data_provider,
    stub_playback_control,
    stub_server_process_proxy,
} from '../../../util'

describe('Server controller', function () {
    const package_json: NormalizedPackageJson = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _id: 'package-id',
        readme: 'README',
        name: 'my-package',
        version: '0.42.17',
    }
    let controller: ServerController
    let playback_control_stub: SinonStubbedInstance<IPlaybackControl>
    let app_data_provider_stub: SinonStubbedInstance<IAppDataProvider>
    let server_process_proxy_stub: SinonStubbedInstance<IServerProcessProxy>

    beforeEach(async function () {
        playback_control_stub = stub_playback_control()
        app_data_provider_stub = stub_app_data_provider()
        server_process_proxy_stub = stub_server_process_proxy()

        const module = await Test.createTestingModule({
            providers: [
                {
                    provide: 'IPlaybackControl',
                    useValue: playback_control_stub,
                },
                {
                    provide: 'IAppDataProvider',
                    useValue: app_data_provider_stub,
                },
                {
                    provide: 'normalized_package_json',
                    useValue: package_json,
                },
                {
                    provide: 'IServerProcessProxy',
                    useValue: server_process_proxy_stub,
                },
                ServerController,
            ],
        }).compile()

        controller = module.get(ServerController)
    })

    it('should return the current status', async function () {
        const last_updated_at = dayjs('2019-10-06T16:34:59.157Z')
        const app_data = new AppDataBuilder().build()
        const backend_information: JsonObject = {
            pid: 42,
            foo: 'bar',
        }

        app_data_provider_stub.get_app_data.returns(app_data)
        app_data_provider_stub.last_updated_at.returns(last_updated_at)
        playback_control_stub.get_playback_backend_information.resolves(backend_information)

        const status = await controller.status()
        expect(status).to.deep.equal({
            digitally_imported: {
                app_version: app_data.app_version,
                deploy_time: app_data.app_deploy_time.toISOString(),
            },
            playback_control: {
                foo: 'bar',
                pid: 42,
            },
            server: {
                last_updated: last_updated_at.toISOString(),
                version: package_json.version,
            },
        })
    })

    it('should shut down the server when requested', async function () {
        const response = mockResponse()
        await controller.shutdown(response)

        expect(response.status).to.have.been.calledOnceWithExactly(HttpStatus.NO_CONTENT)
        expect(response.end).to.have.been.calledOnce
        expect(server_process_proxy_stub.terminate).to.have.been.calledOnce
    })
})
