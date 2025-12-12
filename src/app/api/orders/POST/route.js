import { NextResponse } from 'next/server'
import { createClient } from '../../../../../utils/supabaseserver.ts';

export async function POST(req){
    try {
        const body = await req.json()
        
        const supabase = await createClient()

        const { data, error } = await supabase.rpc("create_order", {
            user_id : body?.user_id,
            address_id : body?.address_id,
            items : body?.items
        })

        if (error) {
            console.log("RPC Error", error)
            return NextResponse.json({error:error?.message}, {status:400})
        }

        return NextResponse.json({ success: true , order: data })
        
    }
    catch (err) {
        console.log("Server Error", err)
        return NextResponse.json({error : err?.message || "Internal Server Error"}, {status : 500})
    }
}