import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './routes/transactions';
import analyticsRoutes from './routes/analytics'

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend is working!' });
});

// Mount routes
app.use('/api/transactions', transactionRoutes)
app.use('/api/analytics', analyticsRoutes)

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });