import {OnApplicationBootstrap, OnApplicationShutdown} from '@nestjs/common'

export interface INotifier extends OnApplicationShutdown, OnApplicationBootstrap {
}
