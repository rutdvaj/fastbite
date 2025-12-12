import { NextResponse } from "next/server";
import { createClient } from "../../../../../../utils/supabaseserver";

export async function POST(req) {
    try {
        const body = await req.json()
        const supabase = await createClient()
        const { order_id } = body
        
        if (!order_id) {
            return NextResponse.json({ error: "Missing required field : order_id" },
                {status:400}
            )
        }

        const { data, error } = await supabase.rpc("get_order_details", {
            order_id : Number(order_id)
        })
        if (error) {
            console.error("RPC error")
            return NextResponse.json({
                error : error.message
            },{status:400})
        }

        return NextResponse.json({success:true, order_details: data}, {status : 200})

    }

    catch (err) {
        console.error(" Server Error", err)
        return NextResponse.json({
           error:err?.message ?? "Internal Server Error"
       }, {status: 500})
    }
}