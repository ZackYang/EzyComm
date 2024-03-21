import { WebSocket, WebSocketServer } from 'ws';
import ConnectionPool from './connectionPool';

const wss = new WebSocketServer({ port: 7070 });
const connectionPool = ConnectionPool.getInstance();

wss.on('connection', (ws: WebSocket, req: any) => {
  console.log(typeof req);
  console.log(req.headers);

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
    console.log('received: %s', data);

    const body = JSON.parse(data);

    console.log(body);
  });

  ws.send('something');
});
