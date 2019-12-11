import {Inject} from '@nestjs/common'

import {ApplicationOptions, Credentials, IArgvParser} from './config'
import {IConfigProvider} from './ConfigProvider.interface'

export class ConfigProvider implements IConfigProvider {
    private readonly options: ApplicationOptions

    public constructor (
        @Inject('IArgvParser') argv_parser: IArgvParser,
        @Inject('argv') argv: string[],
    ) {
        this.options = argv_parser(argv)
    }

    public get server_hostname (): ApplicationOptions['hostname'] {
        return this.options.hostname
    }

    public get server_port (): ApplicationOptions['port'] {
        return this.options.port
    }

    public get log_level (): ApplicationOptions['logLevel'] {
        return this.options.logLevel
    }

    public get notifications (): ApplicationOptions['notifications'] {
        return this.options.notifications
    }

    public get vlc_path (): ApplicationOptions['vlcPath'] {
        return this.options.vlcPath
    }

    public get vlc_timeout (): ApplicationOptions['vlcTimeout'] {
        return this.options.vlcTimeout
    }

    public get vlc_initial_volume (): ApplicationOptions['vlcInitialVolume'] {
        return this.options.vlcInitialVolume
    }

    public get di_url (): ApplicationOptions['url'] {
        return this.options.url
    }

    public get di_listenkey (): ApplicationOptions['listenkey'] {
        return this.options.listenkey
    }

    public get di_frequency_ms (): ApplicationOptions['frequency'] {
        return this.options.frequency
    }

    public get di_quality (): ApplicationOptions['quality'] {
        return this.options.quality
    }

    public get di_credentials (): Credentials|null {
        return this.options.credentials
    }
}
