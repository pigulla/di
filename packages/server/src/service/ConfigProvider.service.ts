import {IConfigProvider} from './ConfigProvider.interface'
import {yargs, CliOptions} from './yargs'

export class ConfigProvider implements IConfigProvider {
    private readonly options: CliOptions

    public constructor (argv: string[]) {
        this.options = yargs.parse(argv) as any as CliOptions
    }

    public get server_hostname (): IConfigProvider['server_hostname'] {
        return this.options.hostname
    }

    public get server_port (): IConfigProvider['server_port'] {
        return this.options.port
    }

    public get log_level (): IConfigProvider['log_level'] {
        return this.options.logLevel
    }

    public get vlc_path (): IConfigProvider['vlc_path'] {
        return this.options.vlcPath
    }

    public get vlc_timeout (): IConfigProvider['vlc_timeout'] {
        return this.options.vlcTimeout
    }

    public get vlc_initial_volume (): IConfigProvider['vlc_initial_volume'] {
        return this.options.vlcInitialVolume
    }

    public get di_url (): IConfigProvider['di_url'] {
        return this.options.url
    }

    public get di_listenkey (): IConfigProvider['di_listenkey'] {
        return this.options.listenkey
    }

    public get di_frequency_ms (): IConfigProvider['di_frequency_ms'] {
        return this.options.frequency
    }
}
