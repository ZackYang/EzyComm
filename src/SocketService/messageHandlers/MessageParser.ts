import OneToOneMessageHandler from "./OneToOneMessageHandler";
import HandlerRegister from "./HandlerRegister";
import { MessageDistnation, MessageType } from "./Types/messageType";
import MessageHandler from "./MessageHandler";

const logger = require('pino')();


class MessageParseError extends Error {
  constructor(errorMessage: string) {
    super(`Error parsing message: ${errorMessage}`);
    this.name = "MessageParseError";
  }
}

class MessageParser {
  messageObject: MessageType = {
    from: "",
    to: '',
    type: '',
    payloadType: '',
    payload: '',
  };

  public handle(message: string) {
    logger.info(`Handling message: ${message}`);

    let messageObject: MessageType | null = null;

    // Try to parse the message
    let distnationHandler: MessageHandler | null = null;
    try {
      messageObject = JSON.parse(message);
    } catch (e) {
      throw new MessageParseError(`Error parsing message: ${e}`);
    }

    // Validate the message
    if (this.validateMessage(messageObject)) {
      distnationHandler = this.getDistnationHandler(messageObject as MessageType);
      distnationHandler.handle(this.messageObject);
    }
  }

  private getDistnationHandler(messageObject: MessageType): MessageHandler {
    const handler = HandlerRegister.getHandler(messageObject.type);

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