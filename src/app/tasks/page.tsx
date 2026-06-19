import { redirect } from "next/navigation"

import { TaskBoard } from "@/components/task-board"
import { createClient } from "@/lib/supabase/server"
import type { Task } from "@/lib/types"

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) redirect("/login")

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("is_completed", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("Unable to load tasks.")
  }

  const email =
    typeof claimsData.claims.email === "string"
      ? claimsData.claims.email
      : "Signed in"

  return <TaskBoard initialTasks={(data ?? []) as Task[]} email={email} />
}
