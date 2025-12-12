import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabaseserver';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
    } = body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order status in database
    const { data, error: updateError } = await supabase.rpc(
      'update_order_payment_success',
      {
        p_order_id: dbOrderId,
        p_razorpay_payment_id: razorpay_payment_id,
        p_razorpay_signature: razorpay_signature,
      }
    );

    if (updateError || !data) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // ✅ Clear the user's cart after successful payment
    const { data: clearCartData, error: clearCartError } = await supabase.rpc('clear_cart');
    
    if (clearCartError) {
      console.error('Failed to clear cart:', clearCartError);
      // Don't fail the payment verification if cart clearing fails
      // The payment was successful, so we still return success
    } else {
      console.log('✅ Cart cleared:', clearCartData);
    }

    // Send confirmation email (non-blocking)
    fetch(`${request.nextUrl.origin}/api/email/send-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: dbOrderId }),
    }).catch(err => console.error('Email send failed:', err));

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: dbOrderId,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}