import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = (err instanceof ApiError ? err.statusCode : undefined) || 500;
  const message = err.message || 'Internal Server Error';
  const code = (err instanceof ApiError ? err.code : undefined) || 'INTERNAL_ERROR';

  console.error(`[API Error] ${req.method} ${req.path}:`, {
    message,
    statusCode,
    code,
    stack: err.stack
  });

  res.status(statusCode).json({
    error: {
      message,
      code,
      statusCode
    }
  });
}

export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
