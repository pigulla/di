import {Injectable, Inject} from '@nestjs/common'
import cheerio from 'cheerio'
import superagent from 'superagent'
import {NodeVM} from 'vm2'

import {IConfigProvider} from './ConfigProvider.interface'
import {AppData, RawAppData, NowPlaying, RawNowPlaying} from './di'
import {IDigitallyImported} from './DigitallyImported.interface'
import {ILogger} from './Logger.interface'

export class DigitallyImportedError extends Error {}

@Injectable()
export class DigitallyImported implements IDigitallyImported {
    private readonly logger: ILogger;
    private readonly url: string;

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config: IConfigProvider,
    ) {
        this.url = config.di_url
        this.logger = logger.for_service(DigitallyImported.name)

        this.logger.log('Service instantiated')
    }

    private extract_app_data (html: string): RawAppData {
        let raw_app_data: RawAppData|null = null

        const vm = new NodeVM({
            console: 'off',
            wrapper: 'none',
            wasm: false,
            sandbox: {
                di: {
                    app: {
                        start (value: RawAppData) {
                            raw_app_data = value
                        },
                    },
                },
            },
        })

        const app_script_tag = cheerio.load(html)('script').toArray()
            .filter(node => node && node.firstChild &&
                node.firstChild.data && node.firstChild.data.includes('di.app.start'))
        const src = (app_script_tag && app_script_tag[0] && app_script_tag[0].firstChild.data)

        if (!src) {
            throw new DigitallyImportedError('Script tag not found')
        }

        try {
            vm.run(src, '/di')
            if (!raw_app_data) {
                throw new DigitallyImportedError('Interceptor not called')
            }
        } catch (error) {
            throw new DigitallyImportedError(`Could not extract appdata (${error.message})`)
        }

        return raw_app_data
    }

    public async load_now_playing (): Promise<NowPlaying[]> {
        const response = await superagent.get(`${this.url}/_papi/v1/di/currently_playing`)

        return (response.body as RawNowPlaying[]).map(NowPlaying.from_raw)
    }

    public async load_app_data (): Promise<AppData> {
        const response = await superagent.get(this.url)
        const raw_app_data = this.extract_app_data(response.text)
        const app_data = AppData.from_raw(raw_app_data)

        this.logger.log('AppData successfully retrieved')
        return app_data
    }
}
