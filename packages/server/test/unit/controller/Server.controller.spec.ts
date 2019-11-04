import dayjs from 'dayjs'
import {SinonStubbedInstance} from 'sinon'
import {Test} from '@nestjs/testing'
import {expect} from 'chai'

import {ServerController} from '@server/controller'
import {ControlInformation, IAppDataProvider, IPlaybackControl} from '@server/service'

import {
    AppDataBuilder,
    create_app_data_provider_stub,
    create_playback_control_stub,
} from '../../util'
import {NormalizedPackageJson} from 'read-pkg'

describe('Server controller', function () {
    let controller: ServerController
    let playback_control_stub: SinonStubbedInstance<IPlaybackControl>
    let app_data_provider_stub: SinonStubbedInstance<IAppDataProvider>
    let package_json: NormalizedPackageJson = {
        _id: 'package-id',
        readme: 'README',
        name: 'my-package',
        version: '0.42.17',
    }

    beforeEach(async function () {
        playback_control_stub = create_playback_control_stub()
        app_data_provider_stub = create_app_data_provider_stub()

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
                    provide: 'NormalizedPackageJson',
                    useValue: package_json,
                },
                ServerController,
            ],
        }).compile()

        controller = module.get(ServerController)
    })

    it('should return the current status', async function () {
        const last_updated_at = dayjs('2019-10-06T16:34:59.157Z')
        const app_data = new AppDataBuilder().build()
        const meta_information: ControlInformation = {
            pid: 42,
            foo: 'bar',
        }

        app_data_provider_stub.get_app_data.returns(app_data)
        app_data_provider_stub.last_updated_at.returns(last_updated_at)
        playback_control_stub.get_meta_information.resolves(meta_information)

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

    it('should load the app data when requested', async function () {
        await controller.update()
        expect(app_data_provider_stub.load_app_data).to.have.been.calledOnce
    })
})
