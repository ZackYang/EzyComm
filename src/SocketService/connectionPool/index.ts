import RedisConnection from "../../lib/RedisConnection";
import { v4 as uuidv4 } from 'uuid';
import ExtWebSocket from "./ExtWebSocket";
import { RedisClientType } from "redis";

RedisConnection.setup({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

class ConnectionPool {
  private connections = new Map<string, ExtWebSocket>();

  private static instance: ConnectionPool;

  // This method will add a new connection to the pool
  private async addConnection({
    userId,
    connection
  }: {
    userId: string,
    connection: ExtWebSocket,
  }): Promise<string> {
    const connectionId = connection.id

    await this.connections.set(`connectionId:${connectionId}`, connection);

    RedisConnection.connect((redisClient: RedisClientType) => {
      redisClient.set(`connectionId:${connectionId}`, `userId:${userId}`);
      redisClient.sAdd(`user:${userId}`, `connectionId:${connectionId}`);
    })

    return connectionId;
  }

  // This method will remove a connection from the pool
  private async removeConnection(connectionId: string) {
    const connection = this.getWebSocket(connectionId);
    if (connection) {
      connection.close();
    }

    this.connections.delete(connectionId);

    RedisConnection.connect((redisClient: RedisClientType) => {
      redisClient.del(`connectionId:${connectionId}`);
      redisClient.sRem(`user:${connectionId}`, `connectionId:${connectionId}`);
    });
  }

  private getWebSocket(connectionId: string) {
    return this.connections.get(connectionId);
  }

  // This method will return the instance of the class
  public static getInstance() {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  // This method will add a new connection to the pool and store it in Redis
  public static async addConnection({
    userId,
    connection
  }: {
    userId: string,
    connection: ExtWebSocket,
  }) {
    return await ConnectionPool.getInstance().addConnection({ userId, connection });
  }

  // This method will remove a connection from the pool
  public static async removeConnection(connectionId: string) {
    return await ConnectionPool.getInstance().removeConnection(connectionId);
  }

  // This method will send a message to a user in all of their connections
  public static async sentToUser({
    userId,
    message
  }: {
      userId: string,
      message: string
  }) {
    RedisConnection.connect(async (redisClient: RedisClientType) => {
      const connectionIds = await redisClient.sMembers(`user:${userId}`)

      connectionIds.forEach((connectionId) => {
        const connection = ConnectionPool.getInstance().getWebSocket(connectionId);

        connection?.send(message);
      });
    })
  }
}

export default ConnectionPool;