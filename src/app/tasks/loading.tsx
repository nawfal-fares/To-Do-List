import { Skeleton } from "@/components/ui/skeleton"

export default function TasksLoading() {
  return (
    <main className="min-h-svh">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
        <div className="mt-16">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-10 w-72 max-w-full" />
          <Skeleton className="mt-7 h-20 w-full rounded-xl" />
          <Skeleton className="mt-8 h-8 w-52" />
          <div className="mt-5 grid gap-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  )
}
