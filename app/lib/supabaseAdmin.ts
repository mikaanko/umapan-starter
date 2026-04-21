import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dev-service-role-key";

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
