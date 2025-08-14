import mongoose from 'mongoose';
import logger from './logger';
import { mongoUri } from '../config/env';

export async function connectToDatabase(): Promise<void> {
  if (!mongoUri) {
    logger.warn('MONGODB_URI not set; skipping DB connection (using in-memory store)');
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error({ error }, 'MongoDB connection error');
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error({ error }, 'MongoDB disconnection error');
  }
}
