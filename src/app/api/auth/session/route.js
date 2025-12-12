// app/api/auth/session/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabaseserver";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({ user });
}
