import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectMongo } from './services/mongo.service';
import { connectRabbitMQ } from './services/rabbitmq.service';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  await connectMongo();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`🚀 API server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Error starting service:', err);
  process.exit(1);
});