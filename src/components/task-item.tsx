"use client"

import { useState, useTransition } from "react"
import {
  CalendarDays,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

type TaskItemProps = {
  task: Task
  onToggle: (task: Task, checked: boolean) => Promise<void>
  onUpdate: (
    task: Task,
    input: { title: string; dueDate: string | null }
  ) => Promise<boolean>
  onDelete: (task: Task) => Promise<void>
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`))
}

function isOverdue(value: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${value}T00:00:00`) < today
}

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [dueDate, setDueDate] = useState(task.due_date ?? "")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (!title.trim()) return

    startTransition(async () => {
      const saved = await onUpdate(task, {
        title: title.trim(),
        dueDate: dueDate || null,
      })
      if (saved) setEditing(false)
    })
  }

  function handleCancel() {
    setTitle(task.title)
    setDueDate(task.due_date ?? "")
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="grid gap-3 rounded-xl border bg-card p-3 shadow-sm sm:grid-cols-[1fr_9.5rem_auto] sm:items-center">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={180}
          autoFocus
          aria-label="Task title"
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSave()
            if (event.key === "Escape") handleCancel()
          }}
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Due date"
        />
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            aria-label="Cancel editing"
          >
            <X />
          </Button>
          <Button
            size="icon"
            onClick={handleSave}
            disabled={isPending || !title.trim()}
            aria-label="Save task"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          </Button>
        </div>
      </div>
    )
  }

  const overdue = Boolean(
    task.due_date && !task.is_completed && isOverdue(task.due_date)
  )

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-card px-3 py-3 shadow-sm transition-colors hover:border-foreground/15",
        task.is_completed && "bg-muted/35 shadow-none"
      )}
    >
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={(checked) => {
          startTransition(() => onToggle(task, checked))
        }}
        disabled={isPending}
        aria-label={
          task.is_completed ? "Mark task as open" : "Mark task as complete"
        }
        className="mt-1"
      />

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "break-words text-sm font-medium leading-6",
            task.is_completed && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>
        {task.due_date ? (
          <Badge
            variant="outline"
            className={cn(
              "mt-1.5 gap-1 border-transparent bg-muted px-1.5 font-normal text-muted-foreground",
              overdue && "bg-amber-50 text-amber-800"
            )}
          >
            <CalendarDays className="size-3" />
            {overdue ? "Overdue · " : ""}
            {formatDueDate(task.due_date)}
          </Badge>
        ) : null}
      </div>

      <div className="flex shrink-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setEditing(true)}
          disabled={isPending}
          aria-label="Edit task"
        >
          <Pencil />
        </Button>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                aria-label="Delete task"
              />
            }
          >
            <Trash2 />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this task?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes “{task.title}” permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  setDeleteOpen(false)
                  startTransition(() => onDelete(task))
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
