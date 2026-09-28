import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/src/app';
import { connectDB } from '../backend/src/config/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error: any) {
    console.error('Serverless Handler Error:', error);
    return res.status(500).json({
      message: 'Serverless execution error',
      error: error?.message || String(error),
    });
  }
}
