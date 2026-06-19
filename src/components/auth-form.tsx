"use client"

import { useActionState } from "react"
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole } from "lucide-react"

import {
  signIn,
  signUp,
  type AuthState,
} from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const initialState: AuthState = {}

function StatusMessage({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-lg bg-destructive/8 px-3 py-2 text-sm text-destructive"
      >
        {state.error}
      </p>
    )
  }

  if (state.message) {
    return (
      <p
        role="status"
        className="flex gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
      >
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        {state.message}
      </p>
    )
  }

  return null
}

function CredentialsFields() {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className="h-10"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="At least 8 characters"
          minLength={8}
          required
          className="h-10"
        />
      </div>
    </>
  )
}

export function AuthForm({ initialError }: { initialError?: string }) {
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState
  )
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialState
  )

  return (
    <Card className="w-full max-w-md border-black/5 bg-white/90 shadow-xl shadow-black/5 backdrop-blur">
      <CardHeader className="gap-2 pb-2">
        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-foreground text-background">
          <LockKeyhole className="size-4" />
        </div>
        <CardTitle className="text-2xl tracking-tight">Welcome</CardTitle>
        <CardDescription>
          Sign in to keep your list private and available everywhere.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {initialError ? (
          <p className="mb-4 rounded-lg bg-destructive/8 px-3 py-2 text-sm text-destructive">
            {initialError}
          </p>
        ) : null}

        <Tabs defaultValue="sign-in">
          <TabsList className="mb-5 grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign in</TabsTrigger>
            <TabsTrigger value="sign-up">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in">
            <form action={signInAction} className="grid gap-4">
              <CredentialsFields />
              <StatusMessage state={signInState} />
              <Button
                type="submit"
                size="lg"
                className="mt-1 h-10"
                disabled={signInPending}
              >
                {signInPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArrowRight />
                )}
                Sign in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="sign-up">
            <form action={signUpAction} className="grid gap-4">
              <CredentialsFields />
              <StatusMessage state={signUpState} />
              <Button
                type="submit"
                size="lg"
                className="mt-1 h-10"
                disabled={signUpPending}
              >
                {signUpPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <ArrowRight />
                )}
                Create account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
