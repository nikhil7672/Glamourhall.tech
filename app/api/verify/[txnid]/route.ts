import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import PayU from 'payu-websdk';

export async function POST(
  request: NextRequest,
  { params }: { params: { txnid: string } }
) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { txnid } = params; // Extract txnid from params

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;

    const payuClient = new PayU({
      key: merchantKey,
      salt: salt
    }, process.env.PAYU_ENVIRONMENT);
    const verified_Data = await payuClient.verifyPayment(params.txnid);
    const data = verified_Data.transaction_details[params.txnid];
    const userId = data?.udf1;
    const plan = data.udf3; // Assuming plan is passed in the transaction data
    const billingCycle = data.udf2; // 'monthly' or 'annual'
    const amount = data.amount; // Payment amount
    const paymentMethod = data.mode; // e.g., 'credit_card', 'paypal'
    
    if (data?.status == 'success' && userId) {
    
      const planExpiresAt = new Date(
        Date.now() + 
        (billingCycle === 'annual' ? 
          365 * 24 * 60 * 60 * 1000 : 
          30 * 24 * 60 * 60 * 1000)
      ).toISOString();

      await supabase
        .from('users')
        .update({
          plan: plan,
          billing_cycle: billingCycle,
          plan_expires_at: planExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    await supabase
    .from('payment_logs')
    .insert({
      user_id: userId,
      transaction_id: txnid,
      amount: amount,
      status: 'success',
      plan: plan,
      billing_cycle: billingCycle,
      payment_method: paymentMethod,
      payment_date: new Date().toISOString()
    });
    // Redirect to the client-side route
    return Response.redirect(
      `${process.env.HOST}/payment/${data.status}/${data.txnid}`
    );


    // If you want to return JSON instead of redirect, uncomment this:
    /*
    return Response.json({
      status: data.status,
      amt: data.amt,
      txnid: data.txnid,
      method: data.mode,
      error: data.error_Message,
      created_at: new Date(data.addedon).toLocaleString()
    });
    */
  } catch (error) {
    return Response.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}