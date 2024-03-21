import MessageHandler from "./MessageHandler";
import OneToOneMessageHandler from "./OneToOneMessageHandler";

class HandlerRegister {
  private static instance: HandlerRegister;
  private handlers: Map<string, MessageHandler>;

  constructor() {
    this.handlers = new Map();
  }

  public static getInstance() {
    if (!HandlerRegister.instance) {
      HandlerRegister.instance = new HandlerRegister();
    }
    return HandlerRegister.instance;
  }

  public static setHandler(type: string, handler: MessageHandler) {
    HandlerRegister.getInstance().handlers.set(type, handler);
  }

  public static getHandler(type: string) {
    return HandlerRegister.getInstance().handlers.get(type);
  }

  public static getHandlers() {
    return HandlerRegister.getInstance().handlers;
  }

  public static getHandlerTypes() {
    return Array.from(HandlerRegister.getInstance().handlers.keys());
  }
}

HandlerRegister.setHandler("oneToOne", new OneToOneMessageHandler());

export default HandlerRegister;