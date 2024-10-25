"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import optGenerator from "otp-generator"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import mailSender from "@/lib/sendMail";
import { otpTemplate } from "@/lib/mail/templates/emailVerification";

export async function signUp(
  credentials: SignUpValues,
): Promise<{ error: string }> {
  try {
    const { username, email, password } = signUpSchema.parse(credentials);

    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateIdFromEntropySize(10);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername && existingUsername.verifiedUser) {
      return {
        error: "Username already taken",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail && existingEmail.verifiedUser) {
      return {
        error: "Email already taken",
      };
    }

    if(existingEmail && !existingEmail.verifiedUser){
      
      
      // const session = await lucia.createSession(userId, {});
      // const sessionCookie = lucia.createSessionCookie(session.id);
      // cookies().set(
      //   sessionCookie.name,
      //   sessionCookie.value,
      //   sessionCookie.attributes,
      // );
      await sendVerificationCode(email);
      return redirect(`/verify-account/${email}`);
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    await sendVerificationCode(email);
    
    // const session = await lucia.createSession(userId, {});
    // const sessionCookie = lucia.createSessionCookie(session.id);
    // cookies().set(
    //   sessionCookie.name,
    //   sessionCookie.value,
    //   sessionCookie.attributes,
    // );
    return redirect(`/verify-account/${email}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}


export async function sendVerificationCode(email: string){
  const otp = optGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false});

  console.log("otp created")
  await prisma.otp.create({
    data: {
      email: email,
      otp : otp
    }
  })
  console.log("otp saved")
  await mailSender({
    email,
    title: "SnapBook - Verification Code",
    body: otpTemplate(otp)
  })

  console.log("otp sended")
}