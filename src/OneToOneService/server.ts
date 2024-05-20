import { type KafkaMessage } from 'kafkajs'
import KafkaConsumer from '../lib/Kafka/KafkaConsumer'
import RedisConnection from '../lib/RedisConnection'
import KafkaProducer from '../lib/Kafka/KafkaProducer'

import pino from 'pino'
import KafkaAdmin from '../lib/Kafka/KafkaAdmin'
import { MessageType } from '../lib/Types/messageType'

const logger = pino()

RedisConnection.setup({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379')
})

logger.info('Starting one-to-one service...')

const findOrCreateTopic = async (): Promise<void> => {
  const admin = KafkaAdmin.getInstance()

  await admin.createTopic({
    topic: 'one-to-one-service',
    numPartitions: 1,
    replicationFactor: 1
  })
}

findOrCreateTopic().then(() => {
  logger.info('Topic created')
}).catch(e => {
  logger.error(e)
})

KafkaConsumer.getInstance({
  groupId: 'oneToOneService',
  clientId: 'oneToOneService'
}).consume({
  topic: 'one-to-one-service',
  onMessage
})

function onMessage(message: KafkaMessage) {
  const payload: MessageType = JSON.parse(message.value?.toString() || '{}')

  const to = payload.to
  const from = payload.from
  const payloadType = payload.payloadType
  const content = payload.payload

  console.log(`Received message from ${from} to ${to}: ${content}`)

  KafkaProducer.sendMessage({
    message: {
      type: 'socket-service',
      from,
      to,
      payloadType,
      payload: content
    },
    topic: 'socket-service'
  })
}
