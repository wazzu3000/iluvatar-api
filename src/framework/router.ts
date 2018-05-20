import * as express from 'express';
import { Controller } from './controller';
import { Session } from './session';
import { Config, AppModel, IluvatarDatabase, IluvatarDatabaseInstancier, Controller as ControllerMaster } from '@wazzu/iluvatar-core';
import { classRequireAuth, methodsRequireAuth } from './decorators/session.decorator';

export class Router {
    
    public constructor(private req: express.Request, private res: express.Response) { }

    public run(iluvatarDatabase: IluvatarDatabase): void {
        if (this.req.method == 'OPTIONS') {
            this.handleCors();
        } else {
            this.handleRequest(iluvatarDatabase);
        }
    }

    private handleCors() {
        let origin = this.req.header('Origin');
        let requestMethod = this.req.header('Access-Control-Request-Method');
        let requestHeaders = this.req.header('Access-Control-Request-Headers');
        this.res.header('Access-Control-Allow-Origin', origin);
        this.res.header('Access-Control-Allow-Methods', requestMethod);
        this.res.header('Access-Control-Allow-Headers', requestHeaders);
        this.res.send();
    }

    private handleRequest(iluvatarDatabase: IluvatarDatabase) {
        let config = Config.getInstance();
        let controller: Controller;
        let req = this.req;
        let res = this.res;
        let db: IluvatarDatabaseInstancier;
        let urlSplited = (req.params[0] as string).replace(/(^\/+|\/{2,})/, '').split('/');
        let schemaName = urlSplited[0];
        let elementId = urlSplited.length > 1 ? urlSplited[1] : null;
        let token = req.header('Authorization');
        let session: Session = null;
        let CustomController = undefined;
        if (token) {
            session = new Session(token);
        }

        db = iluvatarDatabase.newIluvatarDatabaseInstancier(schemaName);
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
                this.handleError('Is required an auth token to access', null);
                return;
            }
        }
        
        db.openConnection().then(db => {
            if (elementId && controller[elementId]) {
                controller[elementId](req.body).then(conRes => this.handleResponse(conRes, db)).catch(err => this.handleError(err, db));
                return;
            }
            controller.session = session;
            controller.elementId = elementId;
            switch (req.method) {
                case 'GET':
                    controller.get(req.query).then(conRes => this.handleResponse(conRes, db)).catch(err => this.handleError(err, db));
                    break;
                case 'POST':
                    controller.post(req.body).then(conRes => this.handleResponse(conRes, db, 201)).catch(err => this.handleError(err, db));
                    break;
                case 'PUT':
                    controller.put(req.body).then(conRes => this.handleResponse(conRes, db)).catch(err => this.handleError(err, db));
                    break;
                case 'DELETE':
                    controller.delete(req.query).then(conRes => this.handleResponse(conRes, db)).catch(err => this.handleError(err, db));
                    break;
            }
        });
    }

    private handleResponse(controllerRes: any, db: IluvatarDatabaseInstancier, httpCode: number = 200) {
        db.closeConnection();
        this.res.status(httpCode).send({
            header: {
                statusCode: httpCode,
                message: ''
            },
            body: controllerRes
        });
    }

    private handleError(errorMessage: string, db: IluvatarDatabaseInstancier, errorCode: number = 1000) {
        let httpCode = errorCode >= 300 && errorCode <= 600 ? errorCode : 200;
        if (db) {
            db.closeConnection();
        }
        this.res.status(httpCode).send({
            header: {
                statusCode: httpCode,
                message: errorMessage
            },
            body: {}
        });
    }
}