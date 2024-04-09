import HandlerPool from "./HandlerPool";
import { MessageType } from "../../lib/Types/messageType";
import MessageHandler from "./MessageHandler";

const logger = require('pino')();


class MessageParseError extends Error {
  constructor(errorMessage: string) {
    super(`Error parsing message: ${errorMessage}`);
    this.name = "MessageParseError";
  }
}

class MessageParser {
  public handle(userId: string, message: string) {
    logger.info(`Handling message: ${message}`);

    let messageObject: MessageType | null = null;

    // Try to parse the message
    let distnationHandler: MessageHandler | null = null;

    try {
      messageObject = JSON.parse(message);
      logger.info(`Parsed message: ${JSON.stringify(messageObject)}`);
    } catch (e) {
      logger.error(`Error parsing message: ${e}`);
    }

    // Assing the user id to the message
    if (messageObject) {
      messageObject.from = userId;
    }

    // Validate the message
    if (this.validateMessage(messageObject)) {
      distnationHandler = this.getDistnationHandler(messageObject as MessageType);
      logger.info(`Distnation handler: ${distnationHandler.constructor.name}`);
      distnationHandler.process(messageObject as MessageType);
      logger.info(`Message handled: ${JSON.stringify(messageObject)}`);
    }
  }

  private getDistnationHandler(messageObject: MessageType): MessageHandler {
    const handler = HandlerPool.getHandler(messageObject.type);

    // If no handler is found, throw an error
    if (!handler) {
      throw new MessageParseError(`No handler found for message type: ${messageObject.type}`);
    }

    return handler
  }

  private validateMessage(message: MessageType | null) {
    if (!message) {
      throw new MessageParseError("Message object is null");
    }
    if (!message.type) {
      throw new MessageParseError("Message type is null");
    }
    if (!message.payloadType) {
      throw new MessageParseError("Message payloadType is empty");
    }
    if (!message.payload) {
      throw new MessageParseError("Message payload is empty");
    }
    return true;
  }
}

export default MessageParser;
export { MessageParseError };