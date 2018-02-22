import { Config, AppModel, AuthModel, DatabaseModel, Schema } from '@wazzu/iluvatar-core';
import { IluvatarDatabase } from '@wazzu/iluvatar-database';
import { Router } from './router';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';
import * as path from 'path';

export class App<T extends IluvatarDatabase> {
    private expressApp: express.Express;
    private appConfig: AppModel;
    private authConfig: AuthModel;
    private databaseConfig: DatabaseModel;

    /**
     * Crea una nueva aplicación con la configuración por default
     */
    public constructor(seed: T);
    /**
     * Crea una nueva aplicación y establece la configuración de esta desde un
     * archivo en formato json
     * @param configFile Ruta del archivo de configuración
     */
    public constructor(seed: T, configFile: string);
    public constructor(private seed: T, configFile: string = '') {
        this.expressApp = express();
        this.appConfig = new AppModel();
        this.authConfig = new AuthModel();
        this.databaseConfig = new DatabaseModel();
        if (configFile) {
            this.loadConfig(configFile);
        }
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use(bodyParser.json());
    }

    /**
     * Establece la configuración de esta desde un archivo en formato json
     * @param configFile Ruta del archivo de configuración
     */
    public loadConfig(configFile: string): void {
        let buffer = fs.readFileSync(configFile);
        let config = JSON.parse(buffer.toString());
        this.setAppConfig(config['app']);
        this.setAuthConfig(config['auth']);
        this.setDatabaseConfig(config['database']);
    }

    /**
     * Establece la configuración general para la aplicación. Aquellos valores
     * que sean omitidos o contengan un valor vacio, tomaran el valor default
     * @param config Modelo que contiene los valores para la configuración
     * general de la aplicación
     */
    public setAppConfig(config: AppModel): void {
        if (config) {
            this.setConfig(this.appConfig, config);
        }
    }

    /**
     * Establece la configuración para la autenticación. Aquellos valores que
     * sean omitidos o contengan un valor vacio, tomaran el valor default
     * @param config Modelo que contiene los valores para la configuración
     * de la autenticación
     */
    public setAuthConfig(config: AuthModel): void {
        if (config) {
            this.setConfig(this.authConfig, config);
        }
    }

    /**
     * Establece la configuración para la base de datos. Aquellos valores que
     * sean omitidos o contengan un valor vacio, tomaran el valor default
     * @param config Modelo que contiene los valores para la configuración
     * de la base de datos
     */
    public setDatabaseConfig(config: DatabaseModel): void {
        if (config) {
            this.setConfig(this.databaseConfig, config);
        }
    }

    public static setConfigValue(key: string, value: any): void {

    }

    public static getConfigValue(key: string): any {

    }

    public run();
    public run(message: string);
    public run(message?: string): void {
        let config = Config.getInstance();
        let self = this;
        config.setConfig('app', this.appConfig);
        config.setConfig('auth', this.databaseConfig);
        config.setConfig('database', this.databaseConfig);
        this.loadDynamicSchemas();
        this.expressApp.listen(this.appConfig.port, () => {
            console.log(message);
            new Router<T>(self.seed, this.expressApp).run();
        });
    }

    private setConfig<T extends Object>(configStored: T, configSended: T) {
        for (let i in configSended) {
            let value = configSended[i];
            if (value) {
                configStored[i] = value;
            }
        }
    }

    private loadDynamicSchemas() {
        let config = Config.getInstance();
        let appModel = config.getConfig('app') as AppModel;
        let schemasPath = appModel.schemasPath
        for (let file of this.getAllFiles(schemasPath)) {
            let SchemaClass = this.require(`${schemasPath}/${file}`);
            let schema = new SchemaClass();
            if (schema instanceof Schema) {
                config.addSchema(schema.name, schema);
            }
        }
    }

    private loadDynamicControllers() {

    }

    private getAllFiles(schemasPath: string): any[] {
        return fs.readdirSync(schemasPath).filter(file => path.extname(file) == '.js');
    }

    private require(filePath: string): any {
        let fileContent = fs.readFileSync(filePath);
        return eval(fileContent.toString());
    }
}