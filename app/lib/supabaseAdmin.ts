import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("Supabase service role key is missing");
}

// Server-only Supabase client with service role for privileged operations.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
