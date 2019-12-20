export class UsuarioModel {

    public constructor(init?: Partial<UsuarioModel>) {
        Object.assign(this, init);
    }
    email: string;
    password: string;
    username: string;
    name: string;
    role: string;
}