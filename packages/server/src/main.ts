import {AddressInfo, Server} from 'net'

import {NormalizedPackageJson} from 'read-pkg'
import {NestFactory} from '@nestjs/core'
import {ValidationPipe} from '@nestjs/common'

import {AppModule} from './module/app.module'
import {Logger} from './service'
import {create_argv_parser} from './service/config'

async function bootstrap (): Promise<void> {
    const argv_parser = create_argv_parser({skip_vlc_validation: true})
    const {logLevel, hostname, port} = argv_parser(process.argv)
    const root_logger = new Logger(logLevel)
    const app = await NestFactory.create(AppModule, {logger: root_logger})

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
}

bootstrap()
