export class UserDTO {
    type!: 'guest'|'public'|'premium';
    authenticated!: boolean;
    id!: number|null;
    has_premium!: boolean|null;
    has_password!: boolean|null;
    favorites!: number[]|null;
    created_at!: string|null;

    constructor (user: UserDTO) {
        Object.assign(this, user);
    }
}
