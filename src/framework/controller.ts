import { Controller as ControllerMaster } from '@wazzu/iluvatar-core';
import { IluvatarDatabaseInstancier, Where } from '@wazzu/iluvatar-core';
import { Session } from './session';
import { requireAuth } from './decorators/session.decorator';

@requireAuth
export class Controller extends ControllerMaster {
    private _session: Session;

    public constructor(db: IluvatarDatabaseInstancier) {
        super(db);
    }

    public get session(): Session {
        return this._session;
    }

    public set session(value: Session) {
        this._session = value;
    }

    @requireAuth()
    public get(payload: any): Promise<any[]> {
        let query = this.db.find();
        for (let i in payload) {
            query.addWhere(new Where(i, '=', payload[i]));
        }
        if (this.elementId) {
            query.addWhere(new Where(this.db.defaultId, '=', this.elementId));
        }
        return query.doQuery();
    }

    public post(payload: any): Promise<any> {
        return this.db.create(payload).doQuery();
    }

    public put(payload: any): Promise<any> {
        let query = this.db.update(payload);
        if (this.elementId) {
            query.addWhere(new Where(this.db.defaultId, '=', this.elementId));
        }
        return query.doQuery();
    }

    public delete(payload: any): Promise<boolean> {
        let query = this.db.delete();
        for (let i in payload) {
            query.addWhere(new Where(i, '=', payload[i]));
        }
        if (this.elementId) {
            query.addWhere(new Where(this.db.defaultId, '=', this.elementId));
        }
        return query.doQuery();
    }
}