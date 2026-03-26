import { Request, Response } from "express";
import rateLimit from "express-rate-limit";

import { env } from "@/config/env.config";

import { sendTooManyRequests } from "@/utils/response.util";

/**
 * General rate limiter for all routes
 */
export const generalRateLimiterMiddleware = rateLimit({
	windowMs: env.RATE_LIMIT_WINDOW_MS,
	max: env.RATE_LIMIT_MAX_REQUESTS,
	message: "Too many requests, please try again later.",
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	handler: (_req: Request, res: Response) => {
		sendTooManyRequests(res, "Too many requests, please try again later.");
	},
});
