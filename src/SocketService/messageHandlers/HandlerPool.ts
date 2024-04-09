import KafkaAdmin from "../../lib/Kafka/KafkaAdmin";
import MessageHandler from "./MessageHandler";

class HandlerPool {
  private static instance: HandlerPool;
  private handlers: Map<string, MessageHandler>;

  constructor() {
    this.handlers = new Map();
  }

  private static async createKafkaTopic(topic: string) {
    const exists = await KafkaAdmin.getInstance().checkTopicExists(topic);

    if (exists) {
      return;
    }

    await KafkaAdmin.getInstance().createTopic({
      topic,
      numPartitions: 1,
      replicationFactor: 1
    });
  }

  public static getInstance(): HandlerPool {
    if (!HandlerPool.instance) {
      HandlerPool.instance = new HandlerPool();
    }

    return HandlerPool.instance;
  }

  public static addHandler({
    handlerName,
    topic
  }: {
    handlerName: string;
    topic: string;
  }): void {
    const handler = new MessageHandler({ handlerName, topic });

    const instance = HandlerPool.getInstance();
    instance.handlers.set(handler.handlerName, handler);

    HandlerPool.createKafkaTopic(handler.topic);
  }

  public static getHandler(handlerName: string): MessageHandler | undefined {
    const instance = HandlerPool.getInstance();
    return instance.handlers.get(handlerName);
  }

  public static addHandlers(handlers: { handlerName: string; topic: string }[]): void {
    handlers.forEach((handler) => {
      HandlerPool.addHandler(handler);
    });
  }
}

export default HandlerPool;