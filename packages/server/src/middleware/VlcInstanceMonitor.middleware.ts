import {Injectable, NestMiddleware, Inject, ServiceUnavailableException} from '@nestjs/common';
import {Request, Response} from 'express';

import {IVlcControl} from '../service';

@Injectable()
export class VlcInstanceMonitor implements NestMiddleware {
    private readonly vlc_control: IVlcControl;

    public constructor (
        @Inject('IVlcControl') vlc_control: IVlcControl,
    ) {
        this.vlc_control = vlc_control;
    }

    public use (_request: Request, _response: Response, next: Function): void {
        if (!this.vlc_control.is_running()) {
            throw new ServiceUnavailableException('VLC instance not running');
        }

        next();
    }
}
