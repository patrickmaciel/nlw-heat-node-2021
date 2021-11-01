import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

interface IPayload {
  sub: string
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // Bearer f0a9sd0f9a9sd0fa09s0dfa0sd9f203f0912
  const [, token] = authToken.split(' ');
  try {
    const { sub } = verify(token, process.env.JWT_SECRET) as IPayload;
    req.user_id = sub;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
