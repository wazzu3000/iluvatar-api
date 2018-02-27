import { IController } from '@wazzu/iluvatar-core';
import { IluvatarDatabase, Where } from '@wazzu/iluvatar-core';

export class Controller implements IController {
    public constructor(protected db: IluvatarDatabase) { }

    public get(payload: any, id?: any): Promise<any[]> {
        let query = this.db.find();
        for (let i in payload) {
            query.addWhere(new Where(i, '=', payload[i]));
        }
        if (id) {
            query.addWhere(new Where(this.db.defaultId, '=', id));
        }
        return query.doQuery();
    }

    public post(payload: any, id?: any): Promise<any> {
        return this.db.create(payload).doQuery();
    }

    public put(payload: any, id?: any): Promise<any> {
        let query = this.db.update(payload);
        if (id) {
            query.addWhere(new Where(this.db.defaultId, '=', id));
        }
        return query.doQuery();
    }

    public delete(payload: any, id?: any): Promise<boolean> {
        let query = this.db.delete();
        for (let i in payload) {
            query.addWhere(new Where(i, '=', payload[i]));
        }
        if (id) {
            query.addWhere(new Where(this.db.defaultId, '=', id));
        }
        return query.doQuery();
    }
}