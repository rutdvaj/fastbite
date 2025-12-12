import { NextResponse } from "next/server";
import { createClient } from "../../../../../utils/supabaseserver";

export async function GET(request, { params }) {
    try {
        const supabase = await createClient();
        const { slug } = await params;

        const { data, error } = await supabase.rpc("get_product_by_slug", {
            slug_input: slug,
        });

        if (error) {
            console.error("RPC Error:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        // If product not found
        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, product: data[0] },
            { status: 200 }
        );
    } catch (err) {
        console.error("Server Error:", err);
        return NextResponse.json(
            { error: err?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
