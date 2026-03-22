import { Request, Response, NextFunction } from 'express';
import { logger, reqCtx } from '@/utils/logger.util';

export const requireAuth = (_req: Request, res: Response, next: NextFunction): void => {
    if(!res.locals.user) {
        logger.warn('Unauthenticated access attempt', { ...reqCtx(_req) });
        return res.redirect('/auth');
    }

    next();
};


export const requireRole = (role: string | string[]) => {
    return (_req: Request, res: Response, next: NextFunction) => {
        if(!res.locals.user) {
            logger.warn('Unauthenticated access attempt', { ...reqCtx(_req) });
            return res.redirect('/auth');
        }

        if(Array.isArray(role) && !role.includes(res.locals.user.role)) {
            logger.warn('Unauthorized access attempt', { requiredRole: role, userRole: res.locals.user.role, ...reqCtx(_req) });
            return res.status(403).send('Forbidden');
        }

        else if(!Array.isArray(role) && res.locals.user.role !== role) {
            logger.warn('Unauthorized access attempt', { requiredRole: role, userRole: res.locals.user.role, ...reqCtx(_req) });
            return res.status(403).send('Forbidden');
        }

        return next();
    }
}