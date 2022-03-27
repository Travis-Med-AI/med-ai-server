import 'reflect-metadata';
import { InversifyExpressServer, TYPE } from 'inversify-express-utils';
// import { makeLoggerMiddleware } from 'inversify-logger-middleware';
import * as bodyParser from 'body-parser';
import { container } from './bindings';
import './controllers';
import { createConnection, Connection } from 'typeorm';
import { TYPES } from './constants/types';
import { APP_SETTINGS } from './constants/appSettings';
import cors from 'cors';
import express from 'express';
import log4js, { Logger } from 'log4js';
import http from 'http';
import socketIO, { Server, Socket } from 'socket.io';
import { RealtimeService } from './services/realtime.service';
import { Notifications } from 'med-ai-common';
import path from 'path';



const configServer = (app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use('/static', express.static('/opt/images'));
}

const configError = (app) => {
    app.use((err, req, res, next) => {
        console.error(err.stack);
        const logger = container.get<Logger>(TYPES.Logger);
        logger.error(err.stack)
        res.status(500).json(err).send();
    });
}

const setUpLogging = () => {
    log4js.configure({
        appenders: {
          logstash: {
            type: '@log4js-node/logstashudp',
            host: APP_SETTINGS.logstash.host,
            port: APP_SETTINGS.logstash.port
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

console.log('connecting to db')

createConnection().then(connection => {
    console.log('created db connection')
    container.bind<Connection>(TYPES.DatabaseConnection).toConstantValue(connection);
    container.bind<Socket>(TYPES.SocketClient).toConstantValue({} as Socket);
    setUpLogging();

    const notifcationService = container.get<RealtimeService>(TYPES.RealtimeService);

    let server = new InversifyExpressServer(container);

    server.setConfig(configServer)
    server.setErrorConfig(configError);

    let app = server.build();
    app.use('/images', express.static(path.resolve('/opt/images')));
    let serverInstance = app.listen(APP_SETTINGS.port);

    let io = socketIO(serverInstance);
    console.log('made it here')
    notifcationService.setupRabbitMq()

    console.log(`server listening on port ${APP_SETTINGS.port}`);
    io.on('connection', (client) => {
      console.log('connected client', client.id)
      container.rebind<Socket>(TYPES.SocketClient).toConstantValue(client);
      notifcationService.socket = client;
      notifcationService.sendNotification('connected to server', Notifications.connected, -1)
    })

})
