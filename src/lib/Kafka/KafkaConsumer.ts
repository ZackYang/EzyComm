import type { Consumer, KafkaMessage } from 'kafkajs'
import { Kafka } from 'kafkajs' // Import the 'Kafka' class from 'kafkajs' package

export default class KafkaConsumer {
  private readonly consumer: Consumer
  private static instance: KafkaConsumer

  constructor ({
    groupId,
    clientId
  }: {
    groupId: string
    clientId: string
  }) {
    this.consumer = new Kafka({
      clientId,
      brokers: process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9092']
    }).consumer({ groupId })
  }

  public async consume ({
    topic,
    onMessage
  }: {
    topic: string
    onMessage: (message: KafkaMessage) => void
  }): Promise<void> {
    await this.consumer.connect()
    await this.consumer.subscribe({ topic })
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        onMessage(message)
      }
    })
  }

  public static getInstance ({
    groupId,
    clientId
  }: {
    groupId: string
    clientId: string
  }): KafkaConsumer {
    KafkaConsumer.instance = new KafkaConsumer({ groupId, clientId })
    return KafkaConsumer.instance
  }
}
