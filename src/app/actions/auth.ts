"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type AuthState = {
  error?: string
  message?: string
}

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

async function getOrigin() {
  const requestHeaders = await headers()
  const forwardedHost = requestHeaders.get("x-forwarded-host")
  const host = forwardedHost ?? requestHeaders.get("host")
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https")

  if (host) return `${protocol}://${host}`

  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL

  if (configuredUrl) {
    return configuredUrl.startsWith("http")
      ? configuredUrl
      : `https://${configuredUrl}`
  }

  return "http://localhost:3000"
}

export async function signIn(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: "Email or password is incorrect." }

  redirect("/tasks")
}

export async function signUp(
  _previousState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." }
  }

  const supabase = await createClient()
  const origin = await getOrigin()
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  })

  if (error) return { error: error.message }
  if (data.session) redirect("/tasks")

  return {
    message:
      "Check your inbox to confirm your email, then come back to sign in.",
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
