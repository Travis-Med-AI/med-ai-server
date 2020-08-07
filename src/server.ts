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
import express from 'express';
import log4js, { Logger } from 'log4js';



const configServer = (app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cors())
    app.use('/static', express.static('/tmp'))
}

const configError = (app) => {
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json(err).send();
    });
}

const setUpLogging = () => {
    log4js.configure({
        appenders: {
          logstash: {
            type: '@log4js-node/logstashudp',
            host: 'localhost',
            port: 5000
          }
        },
        categories: {
          default: { appenders: ['logstash'], level: 'info' }
        }
      });
    const logger = log4js.getLogger();

    logger.info('setting up server')

    container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
}

createConnection().then(connection => {
    container.bind<Connection>(TYPES.DatabaseConnection).toConstantValue(connection);

    setUpLogging();
    
    let server = new InversifyExpressServer(container);

    server.setConfig(configServer)
    server.setErrorConfig(configError);

    let app = server.build();
    app.listen(APP_SETTINGS.port);
    console.log(`server listening on port ${APP_SETTINGS.port}`)
})
