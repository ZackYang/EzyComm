import { MessageParseError, MessageParser } from '../messageHandlers/MessageParser';
import { HandlerRegister } from '../messageHandlers/HandlerRegister';
import { MessageHandler } from '../messageHandlers/MessageHandler';
import { MessageType } from '../messageHandlers/Types/messageType';

describe('MessageParser', () => {
  let mockMessage: string;
  let mockMessageObject: MessageType;
  let mockHandler: MessageHandler;

  beforeEach(() => {
    mockMessage = '{"type": "mockType", "payloadType": "mockPayloadType", "payload": "mockPayload"}';
    mockMessageObject = JSON.parse(mockMessage);
    mockHandler = {
      handle: jest.fn(),
    };
    HandlerRegister.getHandler = jest.fn().mockReturnValue(mockHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should parse the message and set the messageObject property', () => {
    const messageParser = new MessageParser(mockMessage);

    expect(messageParser.messageObject).toEqual(mockMessageObject);
  });

  it('should throw a MessageParseError if the message is not a valid JSON', () => {
    const invalidMessage = 'invalidMessage';

    expect(() => new MessageParser(invalidMessage)).toThrow(MessageParseError);
  });

  it('should validate the message and throw a MessageParseError if the message is null', () => {
    const messageParser = new MessageParser(mockMessage);
    messageParser.messageObject = null;

    expect(() => messageParser.handle()).toThrow(MessageParseError);
  });

  it('should validate the message and throw a MessageParseError if the message type is null', () => {
    const messageParser = new MessageParser(mockMessage);
    messageParser.messageObject.type = null;

    expect(() => messageParser.handle()).toThrow(MessageParseError);
  });

  it('should validate the message and throw a MessageParseError if the message payloadType is empty', () => {
    const messageParser = new MessageParser(mockMessage);
    messageParser.messageObject.payloadType = '';

    expect(() => messageParser.handle()).toThrow(MessageParseError);
  });

  it('should validate the message and throw a MessageParseError if the message payload is empty', () => {
    const messageParser = new MessageParser(mockMessage);
    messageParser.messageObject.payload = '';

    expect(() => messageParser.handle()).toThrow(MessageParseError);
  });

  it('should get the destination handler and call its handle method', async () => {
    const messageParser = new MessageParser(mockMessage);
    await messageParser.handle();

    expect(HandlerRegister.getHandler).toHaveBeenCalledWith(mockMessageObject.type);
    expect(mockHandler.handle).toHaveBeenCalledWith(mockMessageObject);
  });

  it('should throw a MessageParseError if no handler is found for the message type', () => {
    HandlerRegister.getHandler = jest.fn().mockReturnValue(undefined);
    const messageParser = new MessageParser(mockMessage);

    expect(() => messageParser.handle()).toThrow(MessageParseError);
  });
});