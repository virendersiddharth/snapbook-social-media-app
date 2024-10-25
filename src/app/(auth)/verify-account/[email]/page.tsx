"use client"

import { useEffect, useState } from "react";
// import { BiArrowBack } from "react-icons/bi";
import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import OtpInput from "react-otp-input";
import { verifyAccount } from "./actions";
import { ArrowLeft, ArrowLeftSquare, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import { sendVerificationCode } from "../../signup/actions";

export default function Page() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {email}: {email: string} = useParams();
  const encodedEmail = email.replace('%40', '@')
  const {toast} = useToast();

  useEffect(() => {
    // Only allow access of this route when user has filled the signup form
    if (!email) {
      return redirect("/signup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerifyAndSignup = async (e : any) => {
    e.preventDefault();
    setLoading(true);
    setError("")
    console.log(otp, encodedEmail, email)
    const response = await verifyAccount({otp, email: encodedEmail})
    console.log("response", response)
    if(response?.error){
      setError(response.error)
      toast({
        title: response.error,
        // description: "An error occurred while verifying your email",
        variant: "destructive"
      })
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-background">
      
        <div className="max-w-[500px] p-4 lg:p-8 bg-card rounded-lg">
          <h1 className="text-primary font-semibold text-[1.875rem] leading-[2.375rem]">
            Verify Email
          </h1>
          <p className="text-[1.125rem] leading-[1.625rem] my-4 text-richblack-100">
            A verification code has been sent to you. Enter the code below
          </p>
          <form onSubmit={handleVerifyAndSignup}>
            <OtpInput
              value={otp}
              onChange={setOtp}
              numInputs={6}
              renderInput={(props : any) => (
                <input
                  {...props}
                  placeholder="-"
                  style={{
                    boxShadow: "inset -1px -1px 0px rgba(249, 115, 22, 0.2)",
                  }}
                  className="w-[48px] lg:w-[60px] border-0 bg-secondary rounded-[0.5rem] text-secondary-foreground aspect-square text-center focus:border-0 focus:outline-2 focus:outline-orange-100"
                />
              )}
              containerStyle={{
                justifyContent: "space-between",
                gap: "0 6px",
              }}
            />
            <LoadingButton
              type="submit"
              loading={loading}
              className="w-full mt-3"
            >
              Verify Email
            </LoadingButton>
          </form>
          <div className="mt-6 flex items-center justify-between">
            <Link href="/signup">
              <p className="text-secondary-foreground flex items-center gap-x-2">
                <ArrowLeft className="text-primary"/> 
                Back To Signup
              </p>
            </Link>
            <button
              className="flex items-center text-primary gap-x-2"
              onClick={async () => 
                await sendVerificationCode(encodedEmail)
              }
            > 
               <RotateCw />
              Resend it
            </button>
          </div>
        </div>
    </div>
  );
}