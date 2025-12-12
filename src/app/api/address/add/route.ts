import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabaseserver";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { data: addressData, error: addressError } = await supabase.rpc(
      "add_address",
      {
        user_id: body.user_id,
        full_name: body.full_name,
        phone: body.phone,
        line1: body.line1,
        line2: body.line2,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        country: body.country,
      }
    );

    if (addressError) {
      return NextResponse.json(
        { error: addressError.message },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("addresses")
      .update({ onboarding_complete: true })
      .eq("user_id", body.user_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      address: addressData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
