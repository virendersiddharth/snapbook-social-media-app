"use server"

import { isRedirectError } from "next/dist/client/components/redirect"
import prisma from "../../../../lib/prisma"
import {redirect} from "next/navigation"

export async function verifyAccount({otp, email}: {otp: string, email: string}){
    // const email = 
    const encodedEmail = encodeURI(email)
    try {
        if(!otp || !encodedEmail){
            return {
                error: "Please fill the otp"
            }
        }


        console.log("pass 1 ", encodedEmail)

        // Verify otp with your server-side otp service
        const existingOtp = await prisma.otp.findMany({
            where:{
                email: email,
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 1
        })

        console.log("otps : ", otp, existingOtp[0].email)
        console.log("pass 2")

        if(otp !== existingOtp[0].otp){
            return {
                error: "Invalid OTP"
            }
        }

        // const currentDate = new Date();
        // if(currentDate - new Date(existingOtp[0].createdAt) > 5*60*1000)

        console.log("pass 3")

        const userEmail = existingOtp[0].email;
        await prisma.user.update({
            where: {
                email : userEmail,
            },
            data: {
                verifiedUser: true
            }
        })

        console.log("pass 4")

        return redirect("/")
    } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error(error);
        return {
        error: "Something went wrong. Please try again.",
        };
    }
}