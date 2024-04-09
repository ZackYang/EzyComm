import HandlerPool from "../../messageHandlers/HandlerPool";

HandlerPool.addHandlers([
  {
    handlerName: 'oneToOne',
    topic: 'one-to-one-service'
  }
])