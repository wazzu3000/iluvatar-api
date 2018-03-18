import * as bcrypt from 'bcrypt';
import { IluvatarDatabaseInstancier, AuthModel, DatabaseModel, Config, Where } from '@wazzu/iluvatar-core';
import { Controller } from './controller';
import { Session } from './session';

export class SessionController extends Controller {
    protected auth: AuthModel;

    public constructor(db?: IluvatarDatabaseInstancier) {
        super(db);
        this.auth = Config.getInstance().getConfig('auth') as AuthModel;
        this.db.schemaName = this.auth.userSchemaName;
    }

    public get(payload: any): Promise<any[]> {
        throw new Error("Method not implemented.");
    }

    public post(payload: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public put(payload: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public delete(payload: any): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public login(payload: any): Promise<string> {
        let database = Config.getInstance().getConfig('database') as DatabaseModel;
        return this.findUser(payload).then(user => {
            let tokenBody = {};
            tokenBody[database.idFieldName] = user[database.idFieldName]
            return Session.generateToken(tokenBody);
        });
    }

    public signin(payload: any): Promise<any> {
        let passwordFieldName = this.auth.passwordFieldName;
        let self = this;
        return bcrypt.hash(payload[passwordFieldName], 10).then(hash => {
            payload[passwordFieldName] = hash;
            return self.db.create(payload).doQuery();
        });
    }

    public recoveryPass(payload: any) {

    }

    protected findUser(payload: any): Promise<any> {
        let userFieldName = this.auth.userFieldName;
        let passwordFieldName = this.auth.passwordFieldName;
        if (!payload[userFieldName] || !payload[passwordFieldName]) {
            throw new Error(`The ${userFieldName} and ${passwordFieldName} fields are required`);
        }
        return this.db.find().addWhere(new Where(userFieldName, '=', payload[userFieldName])).doQuery().then(users => {
            if (users.length == 0) {
                throw new Error('The user does\'t exists');
            }

            let user = users[0];
            return bcrypt.compare(payload[passwordFieldName], user[passwordFieldName]).then(result => {
                if (!result) {
                    throw new Error('The Password is wrong');
                }

                return user;
            });
        });
    }
}