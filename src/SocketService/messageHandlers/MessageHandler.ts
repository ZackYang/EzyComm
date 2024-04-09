import { MessageType } from "../../lib/Types/messageType";
import KafkaProducer from "../../lib/Kafka/KafkaProducer";


class MessageHandler {
  public handlerName: string;
  public topic: string;

  constructor({
    handlerName,
    topic
  }: {
    handlerName: string;
    topic: string;
  }) {
    this.handlerName = handlerName;
    this.topic = topic;
  }

  public async process(message: MessageType) {
    await KafkaProducer.sendMessage({
      message,
      topic: this.topic
    });
  }
}

export default MessageHandler;