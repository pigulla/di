import {Injectable, Inject} from '@nestjs/common'
import cheerio from 'cheerio'
import superagent, {SuperAgentStatic} from 'superagent'
import {NodeVM} from 'vm2'

import {IConfigProvider} from './ConfigProvider.interface'
import {
    AppData,
    RawAppData,
    NowPlaying,
    RawNowPlaying,
    parse_authentication_response,
    FailedAuthenticationResponse,
    AuthenticationFailureError,
} from './di'
import {Credentials, IDigitallyImported} from './DigitallyImported.interface'
import {ILogger} from './logger'

export class DigitallyImportedError extends Error {}

@Injectable()
export class DigitallyImported implements IDigitallyImported {
    private readonly logger: ILogger
    private readonly url: string

    public constructor (
        @Inject('ILogger') logger: ILogger,
        @Inject('IConfigProvider') config: IConfigProvider,
    ) {
        this.url = config.di_url
        this.logger = logger.child_for_service(DigitallyImported.name)

        this.logger.debug('Service instantiated')
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
            .filter(node => node?.firstChild?.data?.includes('di.app.start') || false)
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

    private async authenticate (credentials: Credentials): Promise<SuperAgentStatic> {
        const agent = superagent.agent()
        const response = await agent
            .post(`${this.url}/login`)
            .type('form')
            .set('x-requested-with', 'XMLHttpRequest')
            .send({
                'member_session[password]': credentials.password,
                'member_session[username]': credentials.username,
                'member_session[remember_me]': 0,
            })
        const auth_response = parse_authentication_response(response.body)

        if (auth_response instanceof FailedAuthenticationResponse) {
            throw new AuthenticationFailureError(auth_response)
        }

        return agent as SuperAgentStatic
    }

    public async load_favorite_channel_keys (credentials: Credentials): Promise<string[]> {
        const agent = await this.authenticate(credentials)
        const raw_app_data = await this.load_raw_app_data(agent)

        return raw_app_data.channels
            .filter(channel => channel.favorite)
            .sort((a, b) => (a.favorite_position || 0) - (b.favorite_position || 0))
            .map(channel => channel.key)
    }

    private async load_raw_app_data (agent: SuperAgentStatic): Promise<RawAppData> {
        const response = await agent.get(this.url)

        return this.extract_app_data(response.text)
    }

    public async load_app_data (): Promise<AppData> {
        const raw_app_data = await this.load_raw_app_data(superagent)
        const app_data = AppData.from_raw(raw_app_data)

        this.logger.debug('AppData successfully retrieved')
        return app_data
    }
}
