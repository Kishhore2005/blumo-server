import { Request, Response } from 'express';
import { getCollection, getCommunicationCollection } from '../services/mongo.service';
import { publishToQueue } from '../services/rabbitmq.service';

export const getEmails = async (req: Request, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.campaignName) {
      filter.campaignName = req.query.campaignName;
    }
    const emails = await getCollection().find(filter).toArray();
    res.json(emails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

export const postEmail = async (req: Request, res: Response) => {
  try {
    const doc = req.body;
    doc.sentAt = new Date();
    // Insert into campaigns collection
    const result = await getCollection().insertOne(doc);
    // Publish to RabbitMQ
    await publishToQueue(doc);
    res.status(201).json({ success: true, message: 'Campaign sent successfully', insertedId: result.insertedId });
  } catch (err) {
    console.error('Error in postEmail:', err); // Log the actual error
    res.status(500).json({ success: false, message: 'Failed to insert email', error: err instanceof Error ? err.message : err });
  }
};

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await getCollection().aggregate([
      { $group: { _id: '$campaignName', count: { $sum: 1 } } },
      { $project: { campaignName: '$_id', count: 1, _id: 0 } }
    ]).toArray();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const getEmailCount = async (req: Request, res: Response) => {
  try {
    const count = await getCollection().countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch email count' });
  }
}; 