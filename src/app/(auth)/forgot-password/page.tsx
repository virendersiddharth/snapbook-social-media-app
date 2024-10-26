"use client"
import LoadingButton from "@/components/LoadingButton"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { forgotPasswordSchema, ForgotPasswordValues } from "@/lib/validation"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { BiArrowBack } from "react-icons/bi"
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "./actions"

export default function Page() {
    const [error, setError] = useState<string>();

    const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleOnSubmit = (values: ForgotPasswordValues) => {
    setError(undefined);
    startTransition(async () => {
      const { error } = await forgotPassword(values);
      if (error) setError(error);
    });
  }

  return (
    <div className="grid min-h-[calc(100vh-60px)] place-items-center bg-background">
      
        <div className="max-w-[500px] p-4 lg:p-8 bg-card rounded-lg">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-primary">
            {!emailSent ? "Reset your password" : "Check email"}
          </h1>
          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100">
            {!emailSent
              ? "Have no fear. We'll email you instructions to reset your password. If you dont have access to your email we can try account recovery"
              : `We have sent the reset email to ${email}`}
          </p>
          <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-3">
        {error && <p className="text-center text-destructive">{error}</p>}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isPending} type="submit" className="w-full">
          Reset Password
        </LoadingButton>
      </form>
    </Form>
          {/* <form onSubmit={handleOnSubmit}>
            {!emailSent && (
              <label className="w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                  Email Address <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="form-style w-full"
                />
              </label>
            )}
            <button
              type="submit"
              className="mt-6 w-full rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900"
            >
              {!emailSent ? "Sumbit" : "Resend Email"}
            </button>
          </form> */}
          <div className="mt-6 flex items-center justify-between">
            <Link href="/login">
              <p className="flex items-center gap-x-2 text-richblack-5">
                <BiArrowBack /> Back To Login
              </p>
            </Link>
          </div>
        </div>
    </div>
  )
}