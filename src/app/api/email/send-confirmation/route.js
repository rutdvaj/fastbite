import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/utils/supabaseserver';
import OrderConfirmationEmail from '../../../_components/orderconfirm.jsx'
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Fetch order details from database
    const { data: orderData, error: dbError } = await supabase.rpc(
      'get_order_details',
      { p_order_id: orderId }
    );

    if (dbError || !orderData || orderData.length === 0) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Group items and extract order info
    const firstRow = orderData[0];
    const orderDetails = {
      orderId: firstRow.order_id,
      totalAmount: firstRow.total_amount,
      createdAt: firstRow.created_at,
      fullName: firstRow.full_name,
      phone: firstRow.phone,
      line1: firstRow.line1,
      line2: firstRow.line2,
      city: firstRow.city,
      state: firstRow.state,
      postalCode: firstRow.postal_code,
      items: orderData.map(row => ({
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price,
        item_total: row.item_total,
      })),
    };

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'FastBite <onboarding@resend.dev>', // Change this after domain verification
      to: [user.email],
      subject: `Order Confirmation #${orderId} - FastBite`,
      react: OrderConfirmationEmail({ orderDetails, userEmail: user.email }),
    });

    if (emailError) {
      console.error('Email error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email', details: emailError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
      emailId: emailData.id,
    });

  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}