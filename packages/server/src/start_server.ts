import {AddressInfo, Server} from 'net'

import {INestApplication, LoggerService, ValidationPipe} from '@nestjs/common'
import {NestFactory} from '@nestjs/core'
import pino from 'pino'
import {NormalizedPackageJson} from 'read-pkg-up'

import {ILogger, LogLevel, RequestResponseLogger} from './domain'
import {create_argv_parser} from './infrastructure/config'
import {adapt_for_request_response, adapt_for_nest, PinoLogger} from './infrastructure/logger'
import {ControllerModule} from './module/application'
import {new_promise} from './new_promise'

type ShutdownFn = () => Promise<void>
type Loggers = {
    nest: Required<LoggerService>
    request_response: RequestResponseLogger
}

function create_loggers(log_level: LogLevel): Loggers {
    const pino_instance = pino({prettyPrint: true})
    const root_logger = new PinoLogger(pino_instance).set_level(log_level)

    return {
        nest: adapt_for_nest(root_logger),
        request_response: adapt_for_request_response(pino_instance),
    }
}

async function create_app(log_level: LogLevel): Promise<INestApplication> {
    const {nest, request_response} = create_loggers(log_level)
    const app = await NestFactory.create(ControllerModule, {logger: nest})

    app.useLogger(nest)
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
    app.use(request_response)
    app.enableShutdownHooks()

    return app
}

export async function start_server(argv: string[] = []): Promise<ShutdownFn> {
    // This is pretty ugly, but there is no good way to ensure that this and the injected
    // argv-value are identical.
    process.argv = argv

    const argv_parser = create_argv_parser({skip_vlc_validation: true})
    const {log_level, server_hostname, server_port} = argv_parser(argv)
    const {promise, resolve} = new_promise<ShutdownFn>()

    const app = await create_app(log_level)
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

    await app.listen(server_port, server_hostname)

    return promise
}
