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
import ampq from 'amqplib/callback_api'


const configServer = (app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use('/static', express.static('/tmp'));
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

const setupRabbitMq = () => {
  ampq.connect('amqp://rabbitmq', (err, connection) => {
    if (err) throw err;

    connection.createChannel((err, channel) => {
      if (err) throw err;
      let queue = 'notifications';

      channel.assertQueue(queue, {
        durable: false
      });
      channel.consume(queue, (msg) => {
        let msgString = msg.content.toString()
        const socket = container.get<Socket>(TYPES.SocketClient);
        socket.emit('notification', msgString)
        const logger = container.get<Logger>(TYPES.Logger);
        logger.info(`Socketio emitted message: ${msgString}`)
      })
    })
  })
}

createConnection().then(connection => {
    container.bind<Connection>(TYPES.DatabaseConnection).toConstantValue(connection);

    setUpLogging();
    
    let server = new InversifyExpressServer(container);

    server.setConfig(configServer)
    server.setErrorConfig(configError);

    let app = server.build();
    let serverInstance = app.listen(APP_SETTINGS.port);

    let io = socketIO(serverInstance);

    console.log(`server listening on port ${APP_SETTINGS.port}`);
    io.on('connection', (client) => {
      console.log('connected client')
      client.emit('notification', 'Connected to server')
      try{
        const socket = container.get<Socket>(TYPES.SocketClient);
        container.rebind<Socket>(TYPES.SocketClient).toConstantValue(client);
        console.log('rebinding')
      } catch {
        container.bind<Socket>(TYPES.SocketClient).toConstantValue(client);
      }
      setupRabbitMq();
    })

})
