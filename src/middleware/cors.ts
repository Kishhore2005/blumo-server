import { ENV } from '../utils/env';
import cors from 'cors';

export default cors({
  origin: ENV.FRONTEND_URL,
  credentials: true,
});