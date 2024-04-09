import HandlerRegister from '../../src/SocketService/messageHandlers/HandlerPool';
import MessageHandler from '../../src/SocketService/messageHandlers/MessageHandler';

describe('HandlerRegister', () => {
  let mockHandler: MessageHandler;

  beforeEach(() => {
    mockHandler = {
      handle: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();

    HandlerRegister.clearHandlers();
  });

  it('should set a handler for a given type', () => {
    const type = 'mockType';
    HandlerRegister.setHandler(type, mockHandler);

    expect(HandlerRegister.getHandler(type)).toEqual(mockHandler);
  });

  it('should return undefined if no handler is set for a given type', () => {
    const type = 'nonExistentType';

    expect(HandlerRegister.getHandler(type)).toBeUndefined();
  });

  it('should return all registered handlers', () => {
    const type1 = 'type1';
    const type2 = 'type2';
    HandlerRegister.setHandler(type1, mockHandler);
    HandlerRegister.setHandler(type2, mockHandler);

    const handlers = HandlerRegister.getHandlers();

    expect(handlers.size).toBe(2);
    expect(handlers.get(type1)).toEqual(mockHandler);
    expect(handlers.get(type2)).toEqual(mockHandler);
  });

  it('should return an array of all registered handler types', () => {
    const type1 = 'type1';
    const type2 = 'type2';
    HandlerRegister.setHandler(type1, mockHandler);
    HandlerRegister.setHandler(type2, mockHandler);

    const handlerTypes = HandlerRegister.getHandlerTypes();

    expect(handlerTypes.length).toBe(2);
    expect(handlerTypes).toContain(type1);
    expect(handlerTypes).toContain(type2);
  });
});