import {NormalizedPackageJson} from 'read-pkg'
import {ServerStatusDTO} from '@digitally-imported/dto'
import {Controller, Delete, HttpStatus, Res, Inject, Get, Put, HttpCode} from '@nestjs/common'
import {Response} from 'express'

import {IAppDataProvider, IVlcControl} from '../service'

@Controller('/server')
export class ServerController {
    private readonly app_data_provider: IAppDataProvider;
    private readonly package_json: NormalizedPackageJson;
    private readonly vlc_control: IVlcControl;

    public constructor (
        @Inject('IVlcControl') vlc_control: IVlcControl,
        @Inject('NormalizedPackageJson') package_json: NormalizedPackageJson,
        @Inject('IAppDataProvider') app_data_provider: IAppDataProvider,
    ) {
        this.app_data_provider = app_data_provider
        this.package_json = package_json
        this.vlc_control = vlc_control
    }

    @Get()
    public async status (): Promise<ServerStatusDTO> {
        const app_data = this.app_data_provider.get_app_data()

        return {
            server: {
                last_updated: this.app_data_provider.last_updated_at().toISOString(),
                version: this.package_json.version,
            },
            vlc: {
                version: this.vlc_control.get_vlc_version(),
                pid: this.vlc_control.get_vlc_pid(),
            },
            digitally_imported: {
                app_version: app_data.app_version,
                deploy_time: app_data.app_deploy_time.toISOString(),
            },
        }
    }

    @Delete()
    public async shutdown (@Res() response: Response): Promise<void> {
        response.status(HttpStatus.NO_CONTENT).end()
        process.kill(process.pid, 'SIGTERM')
    }

    @Put('/update')
    @HttpCode(HttpStatus.NO_CONTENT)
    public async update (): Promise<void> {
        await this.app_data_provider.load_app_data()
    }
}
