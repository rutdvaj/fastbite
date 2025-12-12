import { createClient } from '@/utils/supabaseserver';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { product_id, qty = 1 } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // 🔍 DEBUG: Check what cookies are available
    const allCookies = request.cookies.getAll();
    console.log('All cookies:', allCookies);
    
    // 🔍 DEBUG: Try to get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('User from API:', user);
    console.log('Auth error:', authError);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated', success: false },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc('add_to_cart', {
      p_product_id: product_id,
      p_qty: qty
    });

    if (error) {
      console.error('RPC Error:', error);
      return NextResponse.json(
        { error: error.message, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}