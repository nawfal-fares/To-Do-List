function requiredEnvironmentVariable(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const supabaseUrl = requiredEnvironmentVariable(
  "NEXT_PUBLIC_SUPABASE_URL"
)

export const supabasePublishableKey = requiredEnvironmentVariable(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
)
