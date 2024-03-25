import MessageHandler from "../MessageHandler";
import { MessageType } from "../Types/messageType";
import KafkaProducer from "../KafkaProducer";

class OneToOneMessageHandler extends MessageHandler {
  public async handle(messageObject: MessageType): Promise<void> {
    console.log(`Handling OneToOne message: ${messageObject}`);

    KafkaProducer.sendMessage({
      message: messageObject,
      topic: "oneToOne",
    });
  }
}

export default OneToOneMessageHandler;
