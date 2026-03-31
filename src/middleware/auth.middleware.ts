import { Request, Response, NextFunction } from 'express';
import { logger, reqCtx } from '@/utils/logger.util';
import { sendUnauthorized, sendForbidden } from '@/utils/response.util';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if(!res.locals.user) {
        logger.warn('Unauthenticated access attempt', { ...reqCtx(req) });
        sendUnauthorized(res);
        return;
    }

    next();
};


export const requireRole = (role: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if(!res.locals.user) {
            logger.warn('Unauthenticated access attempt', { ...reqCtx(req) });
            sendUnauthorized(res);
            return;
        }

        const userRole = res.locals.user.role;
        const hasRole = Array.isArray(role) ? role.includes(userRole) : userRole === role;

        if(!hasRole) {
            logger.warn('Unauthorized access attempt', { requiredRole: role, userRole, ...reqCtx(req) });
            sendForbidden(res);
            return;
        }

        next();
    }
}