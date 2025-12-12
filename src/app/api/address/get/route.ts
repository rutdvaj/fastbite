// app/api/address/get/route.ts
import { createClient } from '@/utils/supabaseserver';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get addressId from query params if provided (for single address fetch)
    const searchParams = request.nextUrl.searchParams;
    const addressId = searchParams.get('addressId');

    let result;

    if (addressId) {
      // Fetch single address
      const { data, error } = await supabase
        .rpc('get_address_by_id', {
          p_address_id: parseInt(addressId),
          p_user_id: user.id
        });

      if (error) {
        console.error('Error fetching address:', error);
        return NextResponse.json(
          { error: 'Failed to fetch address' },
          { status: 500 }
        );
      }

      result = data && data.length > 0 ? data[0] : null;
    } else {
      // Fetch all addresses for user
      const { data, error } = await supabase
        .rpc('get_user_addresses', {
          p_user_id: user.id
        });

      if (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json(
          { error: 'Failed to fetch addresses' },
          { status: 500 }
        );
      }

      result = data || [];
    }

    return NextResponse.json(
      { 
        success: true,
        data: result 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}