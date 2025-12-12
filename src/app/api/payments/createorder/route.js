import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabaseserver';
import { redirect } from 'next/navigation';

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // --- USER CHECK ---
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("🔴 Auth Error:", authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- BODY DATA ---
    const body = await request.json();
    const { addressId, totalAmount } = body;

    console.log("📦 Incoming Order Request:");
    console.log("Address ID:", addressId);
    console.log("Total Amount:", totalAmount);
    console.log("User ID:", user.id);

    // --- VALIDATE BASIC INPUT ---
    if (!addressId || !totalAmount || totalAmount <= 0) {
      console.log("❌ Invalid order details");
      return NextResponse.json({ error: 'Invalid order details' }, { status: 400 });
    }

    // --- FETCH CART ITEMS USING YOUR EXISTING RPC ---
    const { data: cartItems, error: cartError } = await supabase.rpc('get_user_cart');

    console.log("🛒 Cart Items from get_user_cart:", { cartItems, cartError });

    if (cartError) {
      console.log("❌ Error fetching cart:", cartError);
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }

    if (!cartItems || cartItems.length === 0) {
      console.log("❌ Cart is empty for user:", user.id);
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // --- DEBUG RAZORPAY CREDENTIALS ---
    console.log("🔑 Razorpay Key Check:");
    console.log("Key ID exists:", !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    console.log("Key ID starts with rzp_test:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_'));
    console.log("Key ID length:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.length);
    console.log("Key ID first 15 chars:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.substring(0, 15));
    console.log("Secret exists:", !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET);
    console.log("Secret length:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET?.length);
    console.log("Secret first 10 chars:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET?.substring(0, 10));

    // --- CREATE RAZORPAY INSTANCE ---
    let razorpay;
    try {
      razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
      });
      console.log("✅ Razorpay instance created successfully");
    } catch (rzpError) {
      console.log("❌ Failed to create Razorpay instance:", rzpError);
      return NextResponse.json({ 
        error: 'Failed to initialize payment gateway',
        details: rzpError.message 
      }, { status: 500 });
    }

    // --- CREATE RAZORPAY ORDER ---
    console.log("⚡ Creating Razorpay Order with params:");
    const orderParams = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: user.id,
        address_id: addressId.toString(),
      },
    };
    console.log(JSON.stringify(orderParams, null, 2));

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(orderParams);
      console.log("🟢 Razorpay Order Created:", razorpayOrder.id);
    } catch (rzpError) {
      console.log("❌ Razorpay Order Creation Failed:");
      console.log("Error:", JSON.stringify(rzpError, null, 2));
      console.log("Status Code:", rzpError.statusCode);
      console.log("Error Code:", rzpError.error?.code);
      console.log("Error Description:", rzpError.error?.description);
      
      return NextResponse.json({ 
        error: 'Payment gateway error',
        details: rzpError.error?.description || rzpError.message,
        code: rzpError.error?.code
      }, { status: 500 });
    }

    // --- CREATE ORDER IN DATABASE USING RPC ---
    const { data: orderData, error: dbError } = await supabase.rpc(
      'create_payment_order',
      {
        p_user_id: user.id,
        p_address_id: addressId,
        p_total_amount: totalAmount,
        p_razorpay_order_id: razorpayOrder.id,
      }
    );

    console.log("🗃 DB Order Insert Result:", { orderData, dbError });

    if (dbError) {
      console.log("❌ Database error:", dbError);
      return NextResponse.json({ 
        error: 'Failed to create order in database',
        details: dbError.message 
      }, { status: 500 });
    }

    if (!orderData || orderData.length === 0) {
      console.log("❌ No order data returned");
      return NextResponse.json({ 
        error: 'Order created but no data returned' 
      }, { status: 500 });
    }

    console.log("✅ Order Successfully Created:", orderData[0]);

    // --- RESPONSE ---
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: orderData[0].order_id,
    });

  } catch (error) {
    console.error('🔥 Order creation error:', error);
    console.error('🔥 Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}