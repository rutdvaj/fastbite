import { NextResponse } from "next/server";
import { createClient } from '../../../../../../utils/supabaseserver.ts'

export async function POST(req) {
    try {
        const body = await req.json()
        const supabase = await createClient()

        const {
      address_id,
      user_id,
      full_name,
      phone,
      line1,
      line2,
      city,
      state,
      postal_code,
      country,
        } = body;
        
        
    if (!address_id || !user_id) {
      return NextResponse.json(
        { error: "Missing required field(s): address_id, user_id" },
        { status: 400 }
      );
        }
        
            const { data, error } = await supabase.rpc("update_address", {
  address_id,
  user_id,
  city,
  state,
  postal_code,
  country,
  line1,
  line2,
  full_name,
  phone,
});

        
        if (error) {
            return NextResponse.json({ error: error?.message } , { status: 400 })
        }

        return NextResponse.json({ success: true, updated_address: data }, { status: 200 })
        

    }
    catch (err) {
         console.error("Server Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
    }
}