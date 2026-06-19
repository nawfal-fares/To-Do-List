"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import type { ActionResult, Task } from "@/lib/types"

const taskIdSchema = z.string().uuid()
const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Give the task a name.").max(180),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
})

async function getAuthorizedClient() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub

  if (error || !userId) {
    return { error: "Your session expired. Sign in again." } as const
  }

  return { supabase, userId } as const
}

export async function createTask(input: {
  title: string
  dueDate?: string | null
}): Promise<ActionResult<Task>> {
  const parsed = taskInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid task." }
  }

  const auth = await getAuthorizedClient()
  if ("error" in auth) return { error: auth.error }

  const { data, error } = await auth.supabase
    .from("tasks")
    .insert({
      user_id: auth.userId,
      title: parsed.data.title,
      due_date: parsed.data.dueDate || null,
    })
    .select("*")
    .single()

  if (error) return { error: "The task could not be added." }

  revalidatePath("/tasks")
  return { data: data as Task }
}

export async function updateTask(
  id: string,
  input: { title: string; dueDate?: string | null }
): Promise<ActionResult<Task>> {
  const parsedId = taskIdSchema.safeParse(id)
  const parsedInput = taskInputSchema.safeParse(input)

  if (!parsedId.success || !parsedInput.success) {
    return { error: "That task could not be updated." }
  }

  const auth = await getAuthorizedClient()
  if ("error" in auth) return { error: auth.error }

  const { data, error } = await auth.supabase
    .from("tasks")
    .update({
      title: parsedInput.data.title,
      due_date: parsedInput.data.dueDate || null,
    })
    .eq("id", parsedId.data)
    .eq("user_id", auth.userId)
    .select("*")
    .single()

  if (error) return { error: "The task could not be updated." }

  revalidatePath("/tasks")
  return { data: data as Task }
}

export async function setTaskCompleted(
  id: string,
  isCompleted: boolean
): Promise<ActionResult<Task>> {
  const parsedId = taskIdSchema.safeParse(id)
  if (!parsedId.success) return { error: "Invalid task." }

  const auth = await getAuthorizedClient()
  if ("error" in auth) return { error: auth.error }

  const { data, error } = await auth.supabase
    .from("tasks")
    .update({ is_completed: isCompleted })
    .eq("id", parsedId.data)
    .eq("user_id", auth.userId)
    .select("*")
    .single()

  if (error) return { error: "The task could not be changed." }

  revalidatePath("/tasks")
  return { data: data as Task }
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const parsedId = taskIdSchema.safeParse(id)
  if (!parsedId.success) return { error: "Invalid task." }

  const auth = await getAuthorizedClient()
  if ("error" in auth) return { error: auth.error }

  const { error } = await auth.supabase
    .from("tasks")
    .delete()
    .eq("id", parsedId.data)
    .eq("user_id", auth.userId)

  if (error) return { error: "The task could not be deleted." }

  revalidatePath("/tasks")
  return {}
}
