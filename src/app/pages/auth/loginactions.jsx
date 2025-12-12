"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabaseserver";

export async function Login(formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");

  const { data: auth, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/error?msg=${encodeURIComponent(error.message)}`);
  }

  // LOG FOR DEBUGGING
  console.log("AUTH USER:", auth.user.id);

  // FETCH THE LATEST ADDRESS RECORD FOR THIS USER
  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .select("onboarding_complete")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false }) // ★ KEY FIX
    .limit(1)
    .single();

  console.log("LOGIN ADDRESS ROW:", address);

  // If no address or onboarding incomplete → redirect to onboarding
  if (!address || !address.onboarding_complete) {
    redirect("/pages/onboarding");
  }

  revalidatePath("/", "layout");
  redirect("/pages/home");
}

// ✅ NEW: Export flag to trigger cart sync on client
export async function getLoginSuccess() {
  return { success: true };
}

export default Login;
