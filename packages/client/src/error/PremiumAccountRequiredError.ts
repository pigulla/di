import {ClientError} from './ClientError';

export class PremiumAccountRequiredError extends ClientError {
    public constructor () {
        super('DigitallyImported premium account required');
    }
}
