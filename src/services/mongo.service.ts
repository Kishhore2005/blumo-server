import { MongoClient, Db, Collection } from 'mongodb';
import { MONGODB_URL, DB_NAME, COLLECTION_NAME } from '../config';

let db: Db;
let collection: Collection;

export async function connectMongo() {
  const client = new MongoClient(MONGODB_URL);
  await client.connect();
  db = client.db(DB_NAME);
  collection = db.collection(COLLECTION_NAME);
  console.log('Connected to MongoDB');
}

export function getCollection() {
  return collection;
}

export function getCommunicationCollection() {
  if (!db) throw new Error('MongoDB not initialized');
  return db.collection('communication');
} 