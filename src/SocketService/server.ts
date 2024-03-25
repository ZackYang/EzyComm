require('dotenv').config()

import { WebSocket, WebSocketServer } from 'ws';
import ConnectionPool from './connectionPool';
import MessageParser from './messageHandlers/MessageParser';

const wss = new WebSocketServer({ port: 7070 });
const connectionPool = ConnectionPool.getInstance();
const logger = require('pino')()
const messageParser = new MessageParser()

wss.on('connection', (ws: WebSocket, req: any) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    ws.close();
    return;
  }

  connectionPool.addConnection({
    id: userId,
    connection: ws
  });

  ws.on('error', console.error);

  ws.on('message', function message(data: string) {
    try {
      messageParser.handle(data)
    } catch (e) {
      console.error(e);
    }
  });

  ws.send('something');
});
