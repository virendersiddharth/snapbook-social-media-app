"use server"
import prisma from "@/lib/prisma";
import mailSender from "../../../lib/sendMail"
import { v4 as uuidv4 } from 'uuid';
import { sendResetPassword } from "@/lib/mail/templates/sendResetPasswordLink";

export async function forgotPassword({email}: {email: string}){
    try {
        const userExist = await prisma.user.findFirst({
            where:{
                email: email
            }
        })
        if(!userExist){
            return {
                error: "User not found"
            }
        }

        if(userExist && !userExist.verifiedUser){
            return {
                error: "Please verify your account first"
            }
        }
        console.log("pass 1")

        const resetPasswordToken = uuidv4()

        console.log("pass 2")

        await prisma.user.update({
            where: {
                id: userExist.id
            },
            data: {
                resetPasswordToken,
                resetPasswordExpiresAt: new Date(Date.now() + 5*60)
            }
        })
        console.log("pass 3")
        const resetPasswordLink = `http://localhost:3000/reset-password/${resetPasswordToken}`
        console.log(resetPasswordLink)
        await mailSender({
            email,
            title: "SnapBook - Forgot Password",
            body: sendResetPassword(resetPasswordLink)
        })


        return {
            error: ""
        }
    } catch (error) {
        console.error(error)
        return {
            error: "Internal server error"
        }
    }
}