import {AddressInfo, Server} from 'net'

import {NormalizedPackageJson} from 'read-pkg'
import {NestFactory} from '@nestjs/core'
import {ValidationPipe} from '@nestjs/common'

import {HttpModule} from './module/http.module'
import {Logger} from './service'
import {create_argv_parser} from './service/config'

type ShutdownFn = () => Promise<void>

export async function start_server (argv: string[] = []): Promise<ShutdownFn> {
    // @ts-ignore
    global.process_argv = argv

    const argv_parser = create_argv_parser({skip_vlc_validation: true})
    const {logLevel, hostname, port} = argv_parser(argv)
    const root_logger = new Logger(logLevel)
    const app = await NestFactory.create(HttpModule, {logger: root_logger})

    app.useLogger(root_logger)
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
    app.use(root_logger.get_request_logger())
    app.enableShutdownHooks()

    const server = app.getHttpServer() as Server
    server.once('listening', function () {
        const {name, version} = app.get<NormalizedPackageJson>('NormalizedPackageJson')
        const address = server.address() as AddressInfo

        root_logger.log(`Application ${name} v${version} listening on ${address.address}:${address.port}`)
    })

    await app.listen(port, hostname)

    return () => app.close()
}
