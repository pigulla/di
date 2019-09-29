import {HttpClientError} from './HttpClientError';

export class PremiumAccountRequiredError extends HttpClientError {
    public constructor () {
        super('DigitallyImported premium account required');
    }
}
