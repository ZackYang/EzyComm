import { MessageType } from "./Types/messageType";
import KafkaProducer from "./KafkaProducer";


class MessageHandler {
  public async handle(message: MessageType): Promise<void> {
    throw new Error("Method not implemented.");
  }

  constructor() {
    this.handle = this.handle.bind(this);
  }

  private async sendMessage(message: MessageType, topic: string): Promise<void> {
    return KafkaProducer.sendMessage({ message, topic });
  }
}

export default MessageHandler;