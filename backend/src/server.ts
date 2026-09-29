import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = Number(process.env.PORT) || 3000;

const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed to start server:', message);
    process.exit(1);
  }
};

void start();
