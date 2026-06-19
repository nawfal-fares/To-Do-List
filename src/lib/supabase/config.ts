const fallbackUrl = "https://cacetazepgiwntumvluw.supabase.co"
const fallbackPublishableKey =
  "sb_publishable_kXqtNFgSIdMYfUY7sjfjcw_fELBVm0O"

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackUrl

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  fallbackPublishableKey
