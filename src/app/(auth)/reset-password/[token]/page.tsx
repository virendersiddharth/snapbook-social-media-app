"use client"
import LoadingButton from "@/components/LoadingButton"
import { PasswordInput } from "@/components/PasswordInput"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { resetPasswordSchema, ResetPasswordValues } from "@/lib/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useParams } from "next/navigation"
import { FormEvent, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { BiArrowBack } from "react-icons/bi"
import { resetPassword } from "./actions"

export default function UpdatePassword() {
  const [error, setError] = useState<string>();

  const [isPending, startTransition] = useTransition();

  const { token }: { token: string } = useParams();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });


  const onSubmit = (values: ResetPasswordValues) => {
    if (!token) {
      return;
    }
    startTransition(async () => {
      const { error } = await resetPassword(values, token)
      if (error) {
        setError(error)
      }
    })
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-background">
      {/* {loading ? (
        <div className="spinner"></div>
      ) : ( */}
      <div className="max-w-[500px] p-4 lg:p-8 bg-card rounded-lg">
        <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-primary">
          Choose new password
        </h1>
        <p className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100">
          Almost done. Enter your new password and you&apos;re all set.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {error && <p className="text-center text-destructive">{error}</p>}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton loading={isPending} type="submit" className="w-full">
              Save Password
            </LoadingButton>
          </form>
        </Form>
        <div className="mt-6 flex items-center justify-between">
          <Link href="/login">
            <p className="flex items-center gap-x-2 text-richblack-5">
              <BiArrowBack /> Back To Login
            </p>
          </Link>
        </div>
      </div>
      {/* )} */}
    </div>
  )
}
