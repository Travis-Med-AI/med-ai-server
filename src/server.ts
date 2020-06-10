import 'reflect-metadata';
import { InversifyExpressServer, TYPE } from 'inversify-express-utils';
// import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as bodyParser from 'body-parser';
import { container } from './bindings';
import './controllers';
import { createConnection, Connection } from 'typeorm';
import { TYPES } from './constants/types';
import jwt from 'express-jwt';
import { APP_SETTINGS } from './constants/appSettings';
import cors from 'cors';

const configServer = (app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cors())
}

const configError = (app) => {
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json(err).send();
    });
}

createConnection().then(connection => {
    container.bind<Connection>(TYPES.DatabaseConnection).toConstantValue(connection);
    let server = new InversifyExpressServer(container);

    server.setConfig(configServer)
    server.setErrorConfig(configError);

    let app = server.build();
    app.listen(APP_SETTINGS.port);
    console.log(`server listening on port ${APP_SETTINGS.port}`)
})
