export type Task = {
  id: string
  user_id: string
  title: string
  due_date: string | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type ActionResult<T = undefined> = {
  data?: T
  error?: string
}
