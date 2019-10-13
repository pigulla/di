import {Injectable, Inject} from '@nestjs/common'

import cheerio from 'cheerio'
import superagent from 'superagent'
import {NodeVM} from 'vm2'

import {AuthenticationError, AppData, RawAppData} from './di'
import {UserType} from './di/User'
import {IConfigProvider} from './ConfigProvider.interface'
import {ILogger} from './Logger.interface'
import {IDigitallyImported, Credentials} from './DigitallyImported.interface'

@Injectable()
export class DigitallyImported implements IDigitallyImported {
    private readonly logger: ILogger;
    private readonly url: string;
    private readonly credentials: Credentials|null;

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config: IConfigProvider
    ) {
        this.url = config.di_url
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.credentials = config.di_listenkey ? null : {email: config.di_username!, password: config.di_password!}
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
            .filter(node => node.firstChild && node.firstChild.data && node.firstChild.data.includes('di.app.start'))
        const src = app_script_tag[0].firstChild.data || ''

        try {
            vm.run(src, '/di')
            if (!raw_app_data) {
                throw new Error('Interceptor not called')
            }
        } catch (error) {
            throw new Error(`Could not extract appdata (${error.message})`)
        }

        return raw_app_data
    }

    public async load_app_data (): Promise<AppData> {
        const agent = superagent.agent()

        const response = !this.credentials
            ? await agent.get(this.url)
            : await agent.post(`${this.url}/login`).type('form').send({
                'member_session[password]': this.credentials.password,
                'member_session[username]': this.credentials.email,
                'member_session[remember_me]': 0,
            })

        const raw_app_data = this.extract_app_data(response.text)

        if (this.credentials && raw_app_data.currentUserType === UserType.GUEST) {
            // We sent credentials but we're not logged in, so something must have gone wrong.
            throw new AuthenticationError()
        }

        const app_data = AppData.from_raw(raw_app_data)

        this.logger.log('AppData successfully retrieved')
        return app_data
    }
}
