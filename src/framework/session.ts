import * as jwt from 'jsonwebtoken';
import { Config, AuthModel, DatabaseModel } from '@wazzu/iluvatar-core';

const tokenRegex = /^Bearer (\w+\.){2}\w+$/;

export class Session {
    private _userId: any;
    private _rolId: any;
    private _user: any;

    public constructor(token: string) {
        if (!tokenRegex.test(token)) {
            throw new Error('The token sended is mal formated');
        }
        let config = Config.getInstance();
        let auth = config.getConfig('auth') as AuthModel;
        let database = config.getConfig('database') as DatabaseModel;
        let tokenDecoded = jwt.verify(token.replace('Bearer ', ''), auth.secretKey);
        let idField = database.idFieldName;
        this._userId = tokenDecoded['data'][idField]; // TODO Debo de agregar los atributos desde el archivo de configuración
        //this._rolId = user['rol_id'];
    }

    public get userId(): any {
        return this._userId
    }

    public get rolId(): any {
        return this._rolId
    }

    public get user(): any {
        return this._user;
    }

    public static generateToken(userData: any): string {
        let auth = Config.getInstance().getConfig('auth') as AuthModel;
        return jwt.sign({ data: userData }, auth.secretKey, {
            expiresIn: auth.ttl,
        });
    }
}