import { NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabaseserver";

export async function GET() {
    try {
        const supabase = await createClient()
        const {data, error} = await supabase.rpc("get_products")
        
        if(error) {
            console.error("RPC Error", error)
            return NextResponse.json({error : error.message}, {status: 400})
        }

        return NextResponse.json({success:true, products: data}, {status: 200})
    }

    catch (err) {
        console.error("Server Error", err)
        return NextResponse.json({error:err?.message || "Internal Server Error"}, {status: 500})
    }
}