import * as express from 'express';
import { IluvatarDatabase } from '@wazzu/iluvatar-database';
import { Controller } from './controller';
import { Config, AppModel } from '@wazzu/iluvatar-core';

export class Router<T extends IluvatarDatabase> {
    
    public constructor(private seed: T, private expressApp: express.Express) { }

    public run(): void {
        let config = Config.getInstance();
        let baseUrl = (config.getConfig('app') as AppModel).routePrefix;
        let self = this;
        this.expressApp.all(`${baseUrl}/*`, (req: express.Request, res: express.Response) => {
            let db: IluvatarDatabase;
            let urlSplited = (req.params[0] as string).split('/');
            let schemaName = urlSplited[0];
            let id = urlSplited.length > 1 ? urlSplited[1] : null;
            try {
                db = self.seed.newInstance(schemaName);
            } catch(err) {
                self.handleError(res, err, db, 404);
            }
            db.openConnection().then(db => {
                let controller = new Controller(db);
                switch (req.method) {
                    case 'GET':
                        controller.get(req.query, id).then(conRes => self.handleResponse(res, conRes, db)).catch(err => self.handleError(res, err, db));
                        break;
                    case 'POST':
                        controller.post(req.body, id).then(conRes => self.handleResponse(res, conRes, db, 201)).catch(err => self.handleError(res, err, db));
                        break;
                    case 'PUT':
                        controller.put(req.body, id).then(conRes => self.handleResponse(res, conRes, db)).catch(err => self.handleError(res, err, db));
                        break;
                    case 'DELETE':
                        controller.delete(req.query, id).then(conRes => self.handleResponse(res, conRes, db)).catch(err => self.handleError(res, err, db));
                        break;
                }
            });
        });
    }

    //private handleRequest

    private handleResponse(res: express.Response, controllerRes: any, db: IluvatarDatabase, httpCode: number = 200) {
        db.closeConnection();
        res.status(httpCode).send({
            header: {
                statusCode: httpCode,
                message: ''
            },
            body: controllerRes
        });
    }

    private handleError(res: express.Response, errorMessage: string, db: IluvatarDatabase, errorCode: number = 1000) {
        let httpCode = errorCode >= 300 && errorCode <= 600 ? errorCode : 200;
        if (db) {
            db.closeConnection();
        }
        res.status(httpCode).send({
            header: {
                statusCode: httpCode,
                message: errorMessage
            },
            body: {}
        });
    }
}