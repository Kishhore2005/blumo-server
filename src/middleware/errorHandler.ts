import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export default (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};