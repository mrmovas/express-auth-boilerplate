import { Router, Request, Response } from "express";

// MIDDLEWARES
// import { validateMiddleware } from '@/middleware/validation.middleware';
import { requireAuth } from "@/middleware/auth.middleware";

// UTILS
import { sendHtml } from "@/utils/sendHtml";


const router = Router();



/**
 * PUBLIC ROUTES
 */
router.get("/", (_req: Request, res: Response) => sendHtml(res, 'home'));
router.get("/auth", (_req: Request, res: Response) => sendHtml(res, 'auth'));

/**
 * PROTECTED ROUTES
 */
router.get("/profile", requireAuth, (_req: Request, res: Response) => sendHtml(res, 'profile'));




export default router;