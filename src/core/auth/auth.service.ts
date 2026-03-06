import { prisma } from "@/config/database.config";

import { hashPassword, comparePassword } from "@/shared/utils/crypto.util";
import { sendVerificationEmail, /*sendPasswordResetEmail, sendWelcomeEmail*/ } from "@/shared/utils/email.util";
import { createTokenService, verifyTokenService } from "../token/token.service";
import { logger } from "@/shared/utils/logger.util";
import { getCtx } from "@/shared/utils/requestContext.utils";

import { SignupInput } from "@/core/auth/auth.validation";




// SIGNUP A NEW USER
type SignupResult =
    | { success: true;  userId: string; email: string }
    | { success: false; error: 'EMAIL_ALREADY_EXISTS'; email: string; message: string }
    | { success: false; error: 'DATABASE_ERROR'; message: string };

export async function signupService(input: SignupInput): Promise<SignupResult> {
    return prisma.$transaction(async (trx) => {
        const existingUser = await trx.user.findFirst({
            where:  { email: input.email },
            select: { id: true },
        });

        // If a user with the same email already exists, reject the registration
        if(existingUser) return { success: false, error: 'EMAIL_ALREADY_EXISTS', email: input.email, message: 'Email is already registered' };
        
        // Create new user
        const user = await trx.user.create({
            data: {
                email:          input.email,
                firstName:      input.firstName,
                lastName:       input.lastName,
                passwordHashed: await hashPassword(input.password),
                phone:          input.phone,   // Json field — Prisma accepts the object directly
            },
            select: { id: true, email: true },
        });

        // Create verification token and send email
        const { token } = await createTokenService(user.id, 'EMAIL_VERIFICATION', trx);

        // Send verification email
        const emailSent = await sendVerificationEmail(user.email, token);
        if(!emailSent) {
            logger.warn('Verification email failed to send after signup', {
                userId: user.id,
                ...getCtx()
            });
        }

        return { success: true, userId: user.id, email: user.email };
    });
}





// VERIFY EMAIL
type VerifyEmailResult =
    | { success: true;  userId: string }
    | { success: false; reason: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'TOKEN_REUSE' };

export async function verifyEmailService(token: string): Promise<VerifyEmailResult> {
    return prisma.$transaction(async (trx) => {
        const userID = await verifyTokenService(token, 'EMAIL_VERIFICATION', trx);

        if(!userID) return { success: false, reason: 'INVALID_TOKEN' };

        // Update user's email verification status in the database
        await trx.user.update({
            where: { id: userID },
            data:  { emailVerified: true },
        });
    
        return { success: true, userId: userID };
    });
}