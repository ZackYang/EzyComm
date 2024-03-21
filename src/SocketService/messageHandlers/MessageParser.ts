import OneToOneMessageHandler from "./OneToOneMessageHandler";
import HandlerRegister from "./HandlerRegister";
import { MessageDistnation, MessageType } from "./Types/messageType";
import MessageHandler from "./MessageHandler";


class MessageParseError extends Error {
  constructor(errorMessage: string) {
    super(`Error parsing message: ${errorMessage}`);
    this.name = "MessageParseError";
  }
}

class MessageParser {
  messageObject: MessageType = null;

  constructor(message: string) {
    try {
      const messageObject: MessageType = JSON.parse(message);
      console.log(messageObject);
      this.messageObject = messageObject;
    } catch (e: any) {
      throw new MessageParseError(e.message);
    }
  }

  public async handle(): Promise<void> {
    this.validateMessage(this.messageObject);
    const distnationHandler = this.getDistnationHandler();
    if (distnationHandler) {
      await distnationHandler.handle(this.messageObject);
    } else {
      if (!this.messageObject) {
        throw new MessageParseError("Message object is null");
      }
      throw new MessageParseError(`No handler found for message type: ${this.messageObject.type}`);
    }
  }

  private getDistnationHandler(): MessageHandler | undefined {
    if (!this.messageObject) {
      throw new MessageParseError("Message object is null");
    }
    return HandlerRegister.getHandler(this.messageObject.type);
  }

  private validateMessage(message: MessageType) {
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