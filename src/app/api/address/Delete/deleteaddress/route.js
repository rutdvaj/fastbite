import { NextResponse } from "next/server";
import { createClient } from "../../../../../../utils/supabaseserver";
export async function POST(req) {
  try {
    const body = await req.json();
    const { address_id, user_id } = body;

    if (!address_id || !user_id) {
      return NextResponse.json(
        { error: "Missing required fields: address_id or user_id" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc("delete_address", {
      address_id,
      user_id,
    });

    if (error) {
      console.error("RPC Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deleted: data }, { status: 200 });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
