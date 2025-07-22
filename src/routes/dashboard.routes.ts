import { Router } from "express";
import { getCollection } from "../services/mongo.service"; // Use this helper!

const router = Router();

router.get("/summary", async (req, res) => {
  try {
    const totalEmails = await getCollection().countDocuments();
    const campaigns = await getCollection()
      .find({}, { projection: { senderMail: 1, campaignName: 1, subject: 1, content: 1, _id: 0 } })
      .toArray();
    res.json({ totalEmails, campaigns });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
