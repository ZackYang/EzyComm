import { MessageType } from "./Types/messageType";


class MessageHandler {
  public async handle(message: MessageType): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default MessageHandler;