import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Enable CORS for all incoming origins with credentials (cookies & headers)
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    callback(null, true); // reflects the requesting origin securely
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use(errorHandler);

export default app;
