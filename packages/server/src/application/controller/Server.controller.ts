import {Controller, Delete, HttpStatus, Res, Inject, Get} from '@nestjs/common'
import {Response} from 'express'
import {NormalizedPackageJson} from 'read-pkg-up'

import {ServerStatusDTO} from '@digitally-imported/dto'

import {IAppDataProvider, IPlaybackControl, IServerProcessProxy} from '../../domain'

@Controller('/server')
export class ServerController {
    private readonly app_data_provider: IAppDataProvider
    private readonly package_json: NormalizedPackageJson
    private readonly playback_control: IPlaybackControl
    private readonly server_process_proxy: IServerProcessProxy

    public constructor(
        @Inject('IPlaybackControl') playback_control: IPlaybackControl,
        @Inject('normalized_package_json') package_json: NormalizedPackageJson,
        @Inject('IAppDataProvider') app_data_provider: IAppDataProvider,
        @Inject('IServerProcessProxy') server_process_proxy: IServerProcessProxy
    ) {
        this.app_data_provider = app_data_provider
        this.package_json = package_json
        this.playback_control = playback_control
        this.server_process_proxy = server_process_proxy
    }

    @Get()
    public async status(): Promise<ServerStatusDTO> {
        const app_data = this.app_data_provider.get_app_data()
        const backend_info = await this.playback_control.get_playback_backend_information()

        return {
            server: {
                last_updated: this.app_data_provider.last_updated_at().toISOString(),
                version: this.package_json.version,
            },
            playback_control: {
                pid: this.playback_control.get_pid(),
                ...backend_info,
            },
            digitally_imported: {
                app_version: app_data.app_version,
                deploy_time: app_data.app_deploy_time.toISOString(),
            },
        }
    }

    @Delete()
    public async shutdown(@Res() response: Response): Promise<void> {
        response.status(HttpStatus.NO_CONTENT).end()
        this.server_process_proxy.terminate()
    }
}
