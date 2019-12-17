import 'module-alias/register'

import {AddressInfo, Server} from 'net'

import {NormalizedPackageJson} from 'read-pkg'
import {NestFactory} from '@nestjs/core'
import {INestApplication, LoggerService, ValidationPipe} from '@nestjs/common'
import pino from 'pino'

import {ControllerModule} from './module/application'
import {adapt_for_request_response, adapt_for_nest, PinoLogger} from './infrastructure/logger'
import {create_argv_parser} from './infrastructure/config'
import {ILogger, LogLevel, RequestResponseLogger} from './domain'

type ShutdownFn = () => Promise<void>
type Loggers = {
    nest: Required<LoggerService>
    request_response: RequestResponseLogger
}

function create_loggers (log_level: LogLevel): Loggers {
    const pino_instance = pino({prettyPrint: true})
    const root_logger = new PinoLogger(pino_instance).set_level(log_level)

    return {
        nest: adapt_for_nest(root_logger),
        request_response: adapt_for_request_response(pino_instance),
    }
}

async function create_app (log_level: LogLevel): Promise<INestApplication> {
    const {nest, request_response} = create_loggers(log_level)
    const app = await NestFactory.create(ControllerModule, {logger: nest})

    app.useLogger(nest)
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
    app.use(request_response)
    app.enableShutdownHooks()

    return app
}

export async function start_server (argv: string[] = []): Promise<ShutdownFn> {
    const argv_parser = create_argv_parser({skip_vlc_validation: true})
    const {log_level, server_hostname, server_port} = argv_parser(argv)

    const app = await create_app(log_level)
    const logger = app.get<ILogger>('ILogger')
    const server = app.getHttpServer() as Server

    server.once('listening', function () {
        const {name, version} = app.get<NormalizedPackageJson>('NormalizedPackageJson')
        const address = server.address() as AddressInfo

        logger.info(`Application ${name} v${version} listening on ${address.address}:${address.port}`)
    })

    await app.listen(server_port, server_hostname)

    return () => app.close()
}
