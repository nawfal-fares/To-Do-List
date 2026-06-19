"use client"

import {
  FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  ClipboardList,
  ListTodo,
  Loader2,
  LogOut,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

import { signOut } from "@/app/actions/auth"
import {
  createTask,
  deleteTask,
  setTaskCompleted,
  updateTask,
} from "@/app/actions/tasks"
import { TaskItem } from "@/components/task-item"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Task } from "@/lib/types"

type Filter = "open" | "all" | "done"

export function TaskBoard({
  initialTasks,
  email,
}: {
  initialTasks: Task[]
  email: string
}) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<Filter>("open")
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isAdding, startAdding] = useTransition()

  const openCount = tasks.filter((task) => !task.is_completed).length
  const doneCount = tasks.length - openCount
  const visibleTasks = useMemo(() => {
    if (filter === "open") return tasks.filter((task) => !task.is_completed)
    if (filter === "done") return tasks.filter((task) => task.is_completed)
    return tasks
  }, [filter, tasks])

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextTitle = title.trim()
    if (!nextTitle) return

    startAdding(async () => {
      const result = await createTask({
        title: nextTitle,
        dueDate: dueDate || null,
      })

      if (result.error || !result.data) {
        toast.error(result.error ?? "The task could not be added.")
        return
      }

      setTasks((current) => [result.data!, ...current])
      setTitle("")
      setDueDate("")
      setFilter("open")
      toast.success("Task added")
      router.refresh()
    })
  }

  async function handleToggle(task: Task, checked: boolean) {
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id ? { ...item, is_completed: checked } : item
      )
    )

    const result = await setTaskCompleted(task.id, checked)
    if (result.error || !result.data) {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? task : item))
      )
      toast.error(result.error ?? "The task could not be changed.")
      return
    }

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? result.data! : item))
    )
    router.refresh()
  }

  async function handleUpdate(
    task: Task,
    input: { title: string; dueDate: string | null }
  ) {
    const previous = task
    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? { ...item, title: input.title, due_date: input.dueDate }
          : item
      )
    )

    const result = await updateTask(task.id, input)
    if (result.error || !result.data) {
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? previous : item))
      )
      toast.error(result.error ?? "The task could not be updated.")
      return false
    }

    setTasks((current) =>
      current.map((item) => (item.id === task.id ? result.data! : item))
    )
    toast.success("Task updated")
    router.refresh()
    return true
  }

  async function handleDelete(task: Task) {
    setTasks((current) => current.filter((item) => item.id !== task.id))
    const result = await deleteTask(task.id)

    if (result.error) {
      setTasks((current) => [task, ...current])
      toast.error(result.error)
      return
    }

    toast.success("Task deleted")
    router.refresh()
  }

  const emptyCopy =
    filter === "done"
      ? {
          title: "Nothing completed yet",
          body: "Finished tasks will collect here.",
          icon: ClipboardList,
        }
      : filter === "all"
        ? {
            title: "Your list is clear",
            body: "Add the first thing worth remembering.",
            icon: ListTodo,
          }
        : {
            title: "You’re all caught up",
            body: "Add something new, or enjoy the quiet.",
            icon: CheckCircle2,
          }
  const EmptyIcon = emptyCopy.icon

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_28rem)]">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
              <ListTodo className="size-4" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">Clearlist</p>
              <p className="text-xs text-muted-foreground">
                A quiet place for the next few things.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-xs text-muted-foreground sm:block">
              {email}
            </span>
            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut />
              </Button>
            </form>
          </div>
        </header>

        <section className="mt-12 sm:mt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">
                {openCount === 0
                  ? "Nothing pressing"
                  : `${openCount} open ${openCount === 1 ? "task" : "tasks"}`}
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                What needs doing?
              </h1>
            </div>
            {doneCount > 0 ? (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {doneCount} done
              </Badge>
            ) : null}
          </div>

          <Card className="border-black/5 bg-card/95 py-0 shadow-lg shadow-black/4">
            <CardContent className="p-3 sm:p-4">
              <form
                onSubmit={handleAdd}
                className="grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
              >
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Add a task…"
                  maxLength={180}
                  aria-label="New task title"
                  className="h-10 border-transparent bg-muted/60 shadow-none focus-visible:bg-background"
                />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  aria-label="Due date"
                  className="h-10 border-transparent bg-muted/60 shadow-none focus-visible:bg-background"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-10 px-4"
                  disabled={isAdding || !title.trim()}
                >
                  {isAdding ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Plus />
                  )}
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as Filter)}
            >
              <TabsList>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="done">Done</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs tabular-nums text-muted-foreground">
              {visibleTasks.length} shown
            </p>
          </div>

          <Separator className="my-4" />

          {visibleTasks.length ? (
            <div className="grid gap-2">
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/35 px-6 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <EmptyIcon className="size-4" />
              </div>
              <h2 className="font-medium">{emptyCopy.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {emptyCopy.body}
              </p>
            </div>
          )}
        </section>

        <footer className="mt-auto pt-12 text-center text-xs text-muted-foreground">
          Your tasks are private to your account.
        </footer>
      </div>
    </main>
  )
}
