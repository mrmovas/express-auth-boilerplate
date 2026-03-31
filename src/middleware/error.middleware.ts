import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger.util';

// Global Error Handler
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
    const status = (err as any).status ?? (err as any).statusCode ?? 500;

    if(status >= 500) {
        logger.error('Unhandled server error', {
            error: err.name,
            message: err.message,
            stack: err.stack,
            method: req.method,
            path: req.path,
            requestId: res.locals.requestId,
        });
    }

    res.status(status).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};