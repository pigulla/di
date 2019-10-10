import {AddressInfo, Server} from 'net'

import {NormalizedPackageJson} from 'read-pkg'
import {NestFactory} from '@nestjs/core'
import {ValidationPipe} from '@nestjs/common'

import {AppModule} from './app.module'
import {IConfigProvider, ILogger} from './service'

async function bootstrap (): Promise<void> {
    const app = await NestFactory.create(AppModule)

    const config_provider = app.get<IConfigProvider>('IConfigProvider')
    const {port, host} = config_provider.server
    const logger = app.get<ILogger>('ILogger')

    app.useLogger(logger)
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}))
    app.use(logger.get_request_logger())
    app.enableShutdownHooks()

    const server = app.getHttpServer() as Server
    server.once('listening', function () {
        const {name, version} = app.get<NormalizedPackageJson>('NormalizedPackageJson')
        const address = server.address() as AddressInfo
        logger.log(`Application ${name} v${version} listening on ${address.address}:${address.port}`)
    })

    await app.listen(port, host)
}

bootstrap()
