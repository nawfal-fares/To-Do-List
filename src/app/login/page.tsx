import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth-form"
import { createClient } from "@/lib/supabase/server"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (data?.claims?.sub) redirect("/tasks")

  const params = await searchParams

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#f5f5f1] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_26rem),radial-gradient(circle_at_80%_80%,rgba(15,23,42,0.06),transparent_24rem)]" />
      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_28rem]">
        <section className="hidden max-w-lg lg:block">
          <p className="mb-5 text-sm font-medium text-emerald-700">
            Clearlist
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-balance">
            Fewer features.
            <br />
            Fewer forgotten things.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
            A focused personal list for adding, finishing, and getting on with
            your day.
          </p>
        </section>

        <AuthForm initialError={params.error} />
      </div>
    </main>
  )
}
