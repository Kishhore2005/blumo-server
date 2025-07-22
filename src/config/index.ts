export const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
export const QUEUE_NAME = process.env.QUEUE_NAME || 'email_campaigns';
export const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
export const DB_NAME = process.env.DB_NAME || 'blumo';
export const COLLECTION_NAME = process.env.COLLECTION_NAME || 'campaigns';
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

//added

export { ENV } from '../utils/env';