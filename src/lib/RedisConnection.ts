import { RedisClientType, createClient } from 'redis';

class RedisConnection {
  private static instance: RedisConnection;
  private client: RedisClientType;

  constructor({
    host,
    port,
    username,
    password
  }: {
    host: string,
    port: number,
    username?: string,
    password?: string
  }) {
    let url = ''

    if (username && password) {
      url = `${username}:${password}@`
    }

    this.client = createClient({
      url: `redis://${url}${host}:${port}`
    });
  }

  public static setup({
    host,
    port,
    username,
    password
  }: {
    host: string,
    port: number,
    username?: string,
    password?: string
  }) {
    RedisConnection.instance = new RedisConnection({ host, port, username, password });
  }

  public static async connect(onConnect?: (client: RedisClientType) => void) {

    if (!RedisConnection.instance.client.isOpen) {
      await RedisConnection.instance.client.connect();
    }

    if (onConnect) {
      onConnect(RedisConnection.instance.client);
    }
  }
}

export default RedisConnection;