import * as express from 'express';
import { Controller } from './controller';
import { Session } from './session';
import { Config, AppModel, IluvatarDatabase, IluvatarDatabaseInstancier, Controller as ControllerMaster } from '@wazzu/iluvatar-core';
import { classRequireAuth, methodsRequireAuth } from './decorators/session.decorator';

export class Router {
    
    public constructor(private iluvatarDatabase: IluvatarDatabase, private expressApp: express.Express) { }

    public run(): void {
        let config = Config.getInstance();
        let baseUrl = (config.getConfig('app') as AppModel).routePrefix;
        let self = this;
        this.expressApp.all(`${baseUrl}/*`, (req: express.Request, res: express.Response) => {
            let controller: Controller;
            let db: IluvatarDatabaseInstancier;
            let urlSplited = (req.params[0] as string).split('/');
            let schemaName = urlSplited[0];
            let elementId = urlSplited.length > 1 ? urlSplited[1] : null;
            let token = req.header('Authorization');
            let session: Session = null;
            let CustomController = undefined;
            debugger;
            if (token) {
                session = new Session(token.replace(/^Bearer\s/, ''));
            }

            debugger;
            db = self.iluvatarDatabase.newIluvatarDatabaseInstancier(schemaName);
            CustomController = config.getController(schemaName);
            if (CustomController) {
                controller = new CustomController(db);
            } else {
                controller = new Controller(db);
            }

            // Verify the access token
            if (!session) {
                let className = controller.constructor.name;
                if (classRequireAuth(className) || methodsRequireAuth(className, elementId)) {
                    self.handleError(res, 'Is required an auth token to access', null);
                    return;
                }
            }
            
            db.openConnection().then(db => {
                if (elementId && controller[elementId]) {
                    controller[elementId](req.body).then(conRes => self.handleResponse(res, conRes, db)).catch(err => self.handleError(res, err, db));
                    return;
                }
                controller.session = session;
                controller.elementId = elementId;
                switch (req.method) {
                    case 'GET':
                        controller.get(req.query).then(conRes => self.handleResponse(res, conRes, db)).catch(err => self.handleError(res, err, db));
                        break;
                    case 'POST':
                        controller.post(req.body).then(conRes => self.handleResponse(res, conRes, db, 201)).catch(err => self.handleError(res, err, db));
                        break;
                    case 'PUT':
                        controller.put(req.body).then(conRes => self.handleResponse(res, conRes, db)).catch(err => self.handleError(res, err, db));
                        break;
                    case 'DELETE':
                        controller.delete(req.query).then(conRes => self.handleResponse(res, conRes, db)).catch(err => self.handleError(res, err, db));
                        break;
                }
            });
        });
    }

    //private handleRequest

    private handleResponse(res: express.Response, controllerRes: any, db: IluvatarDatabaseInstancier, httpCode: number = 200) {
        db.closeConnection();
        res.status(httpCode).send({
            header: {
                statusCode: httpCode,
                message: ''
            },
            body: controllerRes
        });
    }

    private handleError(res: express.Response, errorMessage: string, db: IluvatarDatabaseInstancier, errorCode: number = 1000) {
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