import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

interface AppError extends Error {
  statusCode?: number;
  errors?: Record<string, { message: string }>;
}

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, error: 'Route not found' });
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, error: 'Invalid ticket ID' });
    return;
  }

  if (err.name === 'ValidationError' || err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors ?? {}).map((e) => e.message);
    res.status(400).json({ success: false, errors });
    return;
  }

  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
};
