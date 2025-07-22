import amqp, { ConsumeMessage } from 'amqplib';
import { RABBITMQ_URL, QUEUE_NAME } from '../config';
import { getCollection, getCommunicationCollection } from './mongo.service';

let channel: amqp.Channel | null = null;

export async function connectRabbitMQ() {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log(`Waiting for messages in queue: ${QUEUE_NAME}`);

  channel.consume(
    QUEUE_NAME,
    async (msg: ConsumeMessage | null) => {
      if (msg !== null) {
        try {
          const campaign = JSON.parse(msg.content.toString());
          await getCommunicationCollection().insertOne({
            ...campaign,
            status: 'sent',
            sentAt: new Date(),
          });
          console.log('Saved campaign to communication collection:', campaign);
          if (channel) channel.ack(msg);
        } catch (err) {
          console.error('Failed to process message:', err);
          if (channel) channel.nack(msg, false, false);
        }
      }
    },
    { noAck: false }
  );
}

export async function publishToQueue(message: any) {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized. Call connectRabbitMQ first.');
  }
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
} 