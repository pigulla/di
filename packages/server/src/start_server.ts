import {AddressInfo, Server} from 'net'

import {NormalizedPackageJson} from 'read-pkg'
import {NestFactory} from '@nestjs/core'
import {ValidationPipe} from '@nestjs/common'
import pino from 'pino'

import {HttpModule} from './module/http.module'
import {adapt_for_nest, LogLevel, PinoLogger} from './service'
import {create_argv_parser} from './service/config'
import {adapt_for_request_response, ILogger} from '@server/service/logger'

type ShutdownFn = () => Promise<void>

function create_loggers (log_level: LogLevel): any {
    const pino_instance = pino({prettyPrint: true})
    const root_logger = new PinoLogger(pino_instance).set_level(log_level)

    return {
        nest: adapt_for_nest(root_logger),
        request_response: adapt_for_request_response(pino_instance),
    }
}

export async function start_server (argv: string[] = []): Promise<ShutdownFn> {
    const argv_parser = create_argv_parser({skip_vlc_validation: true})
    const {logLevel, hostname, port} = argv_parser(argv)
    const {nest, request_response} = create_loggers(logLevel)

    const app = await NestFactory.create(HttpModule, {logger: nest})

    app.useLogger(nest)
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
    app.use(request_response)
    app.enableShutdownHooks()

    const logger = app.get<ILogger>('ILogger')
    const server = app.getHttpServer() as Server

    server.once('listening', function () {
        const {name, version} = app.get<NormalizedPackageJson>('NormalizedPackageJson')
        const address = server.address() as AddressInfo

        logger.info(`Application ${name} v${version} listening on ${address.address}:${address.port}`)
    })

    await app.listen(port, hostname)

    return () => app.close()
}
