import MessageHandler from "../MessageHandler";
import { MessageType } from "../Types/messageType";
import KafkaProducer from "../KafkaProducer";

const logger = require('pino')();

class OneToOneMessageHandler extends MessageHandler {
  public async handle(messageObject: MessageType): Promise<void> {
    logger.info(`Handling one to one message: ${JSON.stringify(messageObject)}`);

    KafkaProducer.sendMessage({
      message: messageObject,
      topic: "oneToOne",
    });
  }
}

export default OneToOneMessageHandler;
