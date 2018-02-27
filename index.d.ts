declare module '@wazzu/iluvatar-api' {

    import IluvatarCore = require('@wazzu/iluvatar-core');
    import express = require('express');

    class App<T extends IluvatarCore.IluvatarDatabase> {
        private expressApp: express.Express;
        private appConfig: IluvatarCore.AppModel;
        private authConfig: IluvatarCore.AuthModel;
        private databaseConfig: IluvatarCore.DatabaseModel;
    
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

        /**
         * Establece la configuración de esta desde un archivo en formato json
         * @param configFile Ruta del archivo de configuración
         */
        public loadConfig(configFile: string): void;
    
        /**
         * Establece la configuración general para la aplicación. Aquellos valores
         * que sean omitidos o contengan un valor vacio, tomaran el valor default
         * @param config Modelo que contiene los valores para la configuración
         * general de la aplicación
         */
        public setAppConfig(config: IluvatarCore.AppModel): void;
    
        /**
         * Establece la configuración para la autenticación. Aquellos valores que
         * sean omitidos o contengan un valor vacio, tomaran el valor default
         * @param config Modelo que contiene los valores para la configuración
         * de la autenticación
         */
        public setAuthConfig(config: IluvatarCore.AuthModel): void;
    
        /**
         * Establece la configuración para la base de datos. Aquellos valores que
         * sean omitidos o contengan un valor vacio, tomaran el valor default
         * @param config Modelo que contiene los valores para la configuración
         * de la base de datos
         */
        public setDatabaseConfig(config: IluvatarCore.DatabaseModel): void;

        public static setConfigValue(key: string, value: any): void;
    
        public static getConfigValue(key: string): any;
    
        public run();
        public run(message: string);
    
        private setConfig<T extends Object>(configStored: T, configSended: T);
    }

    class Controller implements IluvatarCore.IController {
        protected db: IluvatarCore.IluvatarDatabase;

        public constructor(db: IluvatarCore.IluvatarDatabase);
        public get(payload: any): Promise<any[]>;
        public post(payload: any): Promise<any>;
        public put(payload: any): Promise<any>;
        public delete(payload: any): Promise<boolean>;
    }

    //export { AppModel, AuthModel, DatabaseModel, Field, FieldType, Schema } from '@wazzu/iluvatar-core';
    //export IluvatarCore.AppModel;
}
