import { Kafka } from 'kafkajs'

import pino from 'pino'
const logger = pino()

export default class KafkaAdmin {
  private readonly admin: any
  private static instance: KafkaAdmin

  private constructor () {
    this.admin = new Kafka({
      brokers: process.env.KAFKA_BROKERS?.split(',') ?? ['localhost:9092']
    }).admin()
  }

  public async createTopic ({
    topic,
    numPartitions,
    replicationFactor
  }: {
    topic: string
    numPartitions: number
    replicationFactor: number
  }): Promise<void> {
    logger.info(`Creating topic: ${topic}`)
    await this.admin.connect()
    await this.admin.createTopics({
      topics: [{
        topic,
        numPartitions,
        replicationFactor
      }]
    })
    await this.admin.disconnect()
    logger.info(`Topic created: ${topic}`)
  }

  // This method is used to check if a topic exists in Kafka
  public async checkTopicExists (topic: string): Promise<boolean> {
    await this.admin.connect()

    try {
      const topicMetadata = await this.admin.fetchTopicMetadata({ topics: [topic] })

      await this.admin.disconnect()
      return topicMetadata.topics.length > 0
    } catch (e: any) {
      logger.error(`Error checking if topic (${topic}) exists: ${e} ${e.stack}`)
      await this.admin.disconnect()
      return false
    }
  }

  public static getInstance (): KafkaAdmin {
    KafkaAdmin.instance = new KafkaAdmin()

    return KafkaAdmin.instance
  }
}
