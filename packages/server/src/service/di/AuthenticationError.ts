export class AuthenticationError extends Error {
    public constructor () {
        super('Authentication failed');
    }
}
