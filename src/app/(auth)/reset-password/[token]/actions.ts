"use server"

import prisma from "@/lib/prisma";
import { hash } from "@node-rs/argon2";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

interface ResetPasswordProps{
    password: string;
    confirmPassword: string;
}
export async function resetPassword({password, confirmPassword} : ResetPasswordProps, token: string){
    try {
        if(!password || !confirmPassword){
            return {
                error: "Password and confirm password are required"
            }
        }
        if(password !== confirmPassword){
            return {
                error: "Passwords do not match"
            }
        }

        const passwordHash = await hash(password, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
          });

        console.log("token: ", token)

        const existingUser = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                // resetPasswordExpiresAt: {gt: new Date()}
            },
        })

        if(!existingUser){
            return {
                error: "Invalid token or token expired"
            }
        }

        await prisma.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                passwordHash,
                resetPasswordToken: null,
                resetPasswordExpiresAt: null
            }
        })

        return redirect("/login");
    } catch (error) {
        if(isRedirectError(error)){
            throw error;
        }
        console.error(error);
        return {
            error: "Internal server error"
        }
    }
} 