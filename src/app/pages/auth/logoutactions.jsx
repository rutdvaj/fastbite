"use server";

import { createClient } from "../../../../utils/supabaseserver";
import { redirect } from "next/navigation";

export async function Logout() {
  const supabase = await createClient();

  // Supabase logout (server-side)
  await supabase.auth.signOut();

  // Redirect to login page
  redirect("/pages/auth/login");
}
