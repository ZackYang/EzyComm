import { Kafka, Producer } from 'kafkajs'
import { MessageType } from './Types/messageType'

const logger = require('pino')()

export default class KafkaProducer {
  private producer: Producer

  private static instance: KafkaProducer

  constructor() {
    this.producer = this.createProducer()
  }

  public static getInstance() {
    if (!KafkaProducer.instance) {
      KafkaProducer.instance = new KafkaProducer()
    }
    return KafkaProducer.instance
  }

  private createProducer(): Producer {
    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'socket-service',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092']
    })

    return kafka.producer()
  }

  public static async sendMessage({ message, topic }: { message: MessageType, topic: string }) {
    const producer = KafkaProducer.getInstance().producer
    producer.connect()
      .then(() => {
        producer.send({
          topic: topic,
          messages: [
            { value: JSON.stringify(message) }
          ]
        })
      }
      )
      .catch((e) => {
        let retryCount = 0;
        const maxRetries = 50;

        logger.error(`Error sending message to Kafka: ${e}`);
        logger.info(`Retrying in 10 seconds...`);
        logger.info(`Retry count: ${retryCount}`);

        const retryInterval = 6000; // milliseconds

        const retry = () => {
          if (retryCount < maxRetries) {
            setTimeout(() => {
              producer.send({
                topic: topic,
                messages: [
                  { value: JSON.stringify(message) }
                ]
              })
                .catch(() => {
                  retryCount++;
                  retry();
                });
            }, retryInterval);
          }
        };

        retry();
      })
  }
}