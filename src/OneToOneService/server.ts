import { KafkaMessage } from "kafkajs";
import KafkaConsumer from "../lib/Kafka/KafkaConsumer";
import RedisConnection from "../lib/RedisConnection";
import KafkaProducer from "../lib/Kafka/KafkaProducer";
import { MessageType } from "../lib/Types/messageType";

const logger = require('pino')();

RedisConnection.setup({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
});

KafkaConsumer.getInstance({
  groupId: 'oneToOneService',
  clientId: 'oneToOneService'
}).consume({
  topic: 'one-to-one-service',
  onMessage: onMessage
});

function onMessage(message: KafkaMessage) {
  const payload: MessageType = JSON.parse(message.value?.toString() || '{}')

  const to = payload.to
  const from = payload.from
  const payloadType = payload.payloadType
  const content = payload.payload

  console.log(`Received message from ${from} to ${to}: ${content}`)

  KafkaProducer.sendMessage({
    message: {
      type: "socket-service",
      from: from,
      to: to,
      payloadType: payloadType,
      payload: content
    },
    topic: 'socket-service'
  })
}