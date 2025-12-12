import { NextResponse } from "next/server";
import { createClient } from "../../../../../../utils/supabaseserver";

export async function POST(req) {
    try {
        const body = await req.json()
        const supabase = await createClient()
        const { uid } = body
        
        if (!uid) {
            return NextResponse.json({error : "Missing field : UID"}, {status: 400})
        }
        const { data, error } = await supabase.rpc("get_user_orders", { uid })
        
        
    if (error) {
      console.error("RPC Error", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
        }
        
        return NextResponse.json({success:true, orders:data}, {status: 200})
    }   
    catch (err) {
         console.error("Server Error", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
    }
}