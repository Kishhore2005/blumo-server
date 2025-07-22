import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import jwksClient from 'jwks-rsa';
import { ENV } from '../utils/env';

const client = jwksClient({
  jwksUri: `${ENV.KEYCLOAK_BASE_URL}/realms/${ENV.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key: any) {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

export function apiAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      (req as any).user = decoded;
      next();
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
} 