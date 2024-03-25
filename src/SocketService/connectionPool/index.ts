import { WebSocket } from "ws";

class ConnectionPool {
  private connections = new Map<string, WebSocket[]>();

  private static instance: ConnectionPool;
  private constructor() {
  }

  // This method will return the instance of the class
  public static getInstance() {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  // This method will merge connections for a given user
  private mergeConnections = (id: string, connection: WebSocket) => {
    const existingConnections = this.connections.get(id);

    if (existingConnections) {
      this.connections.set(id, [
        ...existingConnections,
        connection
      ]);
    } else {
      this.connections.set(id, [connection]);
    }
  }

  public removeConnection = (id: string, connection: WebSocket) => {
    const connections = this.connections.get(id);

    if (connections) {
      this.connections.set(
        id,
        connections.filter(existingConnection => existingConnection !== connection)
      );
    }
  }

  // This method will add a new connection to the pool
  public addConnection({
    id,
    connection
  }: {
    id: string,
    connection: WebSocket
  }) {
    this.mergeConnections(id, connection);
  }

  // This method will return all connections for a given user
  public getConnection(id: string) {
    return this.connections.get(id);
  }

  // This method will send a message to all connections for a given user
  public sendToUser(id: string, message: string) {
    const connections = this.getConnection(id);

    if (connections) {
      connections.forEach(connection => {
        connection.send(message);
      });
    }
  }
}

export default ConnectionPool;