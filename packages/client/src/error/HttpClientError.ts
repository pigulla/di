export class HttpClientError extends Error {
    public readonly cause: Error|null;

    public constructor (message: string, cause: Error|null = null) {
        super(message);

        this.cause = cause;
    }
}
