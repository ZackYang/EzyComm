import { type WebSocket, WebSocketServer } from 'ws'
import ConnectionPool from './connectionPool'
import MessageParser from './messageHandlers/MessageParser'
import type ExtWebSocket from './connectionPool/ExtWebSocket'
import { v4 as uuidv4 } from 'uuid'
import KafkaConsumer from '../lib/Kafka/KafkaConsumer'
import { type MessageType } from '../lib/Types/messageType'
import KafkaAdmin from '../lib/Kafka/KafkaAdmin'

import pino from 'pino'

require('dotenv').config()

require('./config/initializers/MessageHandlerConfig')

const port = process.env.SOCKET_PORT ?? '7070'

console.log('Starting server...')
console.log(`Listening on port '${port}'`)

const wss = new WebSocketServer({ port: parseInt(port) })
const messageParser = new MessageParser()

wss.on('connection', (webSocket: WebSocket, req: any) => {
  const ws = webSocket as ExtWebSocket
  const userId = req.headers['x-user-id']

  if (!userId) {
    ws.close()
    return
  }

  ws.id = uuidv4()

  ConnectionPool.addConnection({
    userId,
    connection: ws
  })

  ws.on('error', console.error)

  ws.on('message', function message(data: string) {
    try {
      messageParser.handle(userId, data)
    } catch (e: any) {
      console.error(e)
      ws.send(JSON.stringify({
        type: 'error',
        payload: {
          message: e.message
        }
      }))
    }
  })

  ws.on('close', () => {
    ConnectionPool.removeConnection(ws.id)

    console.log(`Connection closed: ${ws.id}`)
  })

  ws.on('disconnect', () => {
    ConnectionPool.removeConnection(ws.id)

    console.log(`Connection disconnected: ${ws.id}`)
  })
})

// check if the 'socket-service' topic exists
// if it doesn't, create it

const findOrCreateTopic = async (topic: string = 'socket-service'): Promise<void> => {
  const kafkaAdmin = KafkaAdmin.getInstance()

  const exists = await kafkaAdmin.checkTopicExists('socket-service')
  if (!exists) {
    await kafkaAdmin.createTopic({
      topic: 'socket-service',
      numPartitions: 1,
      replicationFactor: 1
    })
  }
}

findOrCreateTopic().then(() => {
  console.log('Topic created')
}).catch(e => {
  console.error(e)
})

// const kafkaConsumer = KafkaConsumer.getInstance({
//   groupId: 'socket-service',
//   clientId: 'socket-service'
// })

// This will consume messages from the 'socket-service' topic
// and send them to the appropriate user
// kafkaConsumer.consume({
//   topic: 'socket-service',
//   onMessage: async ({ value }) => {
//     console.log(value?.toString())

//     const message: MessageType = JSON.parse(value?.toString() || '{}')
//     const { type, from, to, payloadType, payload } = message

//     if (type === 'socket-service') {
//       ConnectionPool.sentToUser({
//         userId: to,
//         message: JSON.stringify({
//           from,
//           to,
//           type: payloadType,
//           payload
//         })
//       })
//     }
//   }
// })
