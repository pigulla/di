import {AddressInfo, Server} from 'net'

import {INestApplication, LoggerService, ValidationPipe} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'
import pino from 'pino'
import {NormalizedPackageJson} from 'read-pkg-up'

import {ILogger, RequestResponseLogger} from './domain'
import {create_argv_parser} from './infrastructure/config'
import {adapt_for_request_response, adapt_for_nest, PinoLogger} from './infrastructure/logger'
import {ControllerModule} from './module/application'
import {new_promise} from './new_promise'

type ShutdownFn = () => Promise<void>
type Loggers = {
    root: ILogger
    nest: Required<LoggerService>
    request_response: RequestResponseLogger
}

function create_loggers(): Loggers {
    const pino_instance = pino({
        prettyPrint: true,
        redact: ['di_listenkey', 'di_credentials.password'],
    })
    const root_logger = new PinoLogger(pino_instance)

    return {
        root: root_logger,
        nest: adapt_for_nest(root_logger),
        request_response: adapt_for_request_response(pino_instance),
    }
}

async function create_app(
    nest_logger: LoggerService,
    request_response_logger: RequestResponseLogger
): Promise<INestApplication> {
    const app = await NestFactory.create(ControllerModule, {logger: nest_logger})
    app.useLogger(nest_logger)
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
    app.use(request_response_logger)
    app.enableShutdownHooks()

    return app
}

export async function start_server(argv: string[] = []): Promise<ShutdownFn> {
    // This is pretty ugly, but there is no good way to ensure that this and the injected
    // argv-value are identical.
    process.argv = argv

    const {root, nest, request_response} = create_loggers()
    const argv_parser = create_argv_parser({skip_vlc_validation: true})

    try {
        const options = argv_parser(argv)
        const {promise, resolve} = new_promise<ShutdownFn>()

        root.set_level(options.log_level)
        root.debug('Starting application', options)

        const app = await create_app(nest, request_response)
        const logger = app.get<ILogger>('ILogger')
        const server = app.getHttpServer() as Server

        server.once('listening', function () {
            const {name, version} = app.get<NormalizedPackageJson>('normalized_package_json')
            const address = server.address() as AddressInfo

            logger.info(
                `Application ${name} v${version} listening on ${address.address}:${address.port}`
            )
            resolve(() => app.close())
        })

        await app.listen(options.server_port, options.server_hostname)

        return promise
    } catch (error) {
        root.fatal('Error during application startup', error)
        throw error
    }
}
