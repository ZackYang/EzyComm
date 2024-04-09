import { WebSocket } from "ws";

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
  id: string;
}

export default ExtWebSocket;