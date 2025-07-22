import { Router } from 'express';
import { getEmails, postEmail, getCampaigns, getEmailCount } from '../controllers/campaign.controller';

const router = Router();

router.get('/emails', getEmails);
router.post('/emails', postEmail);
router.get('/campaigns', getCampaigns);
router.get('/emails/count', getEmailCount);

export default router; 