export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import PayU from "payu-websdk";



export async function POST(req: Request) {
  try {
    const paymentData:any = await req.json();

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;
    const host = process.env.HOST;

    if (!merchantKey || !salt || !host) {
      throw new Error('Missing required environment variables');
    }

    // Generate unique transaction ID
    const txnId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create hash string as per PayU documentation
    const hashParams = {
      key: merchantKey,
      txnid: txnId,
      amount: paymentData.amount.toString(),
      productinfo: paymentData.product,
      firstname: paymentData.firstname,
      email: paymentData.email
    };

    const hash = generateHash(hashParams, salt);

    // Initialize PayU client
    const payuClient = new PayU({
      key: merchantKey,
      salt: salt
    },process.env.PAYU_ENVIRONMENT);

    // Prepare payment data
    const paymentRequest = {
      key: merchantKey,
      txnid: txnId,
      amount: paymentData.amount,
      productinfo: JSON.stringify(paymentData.product),
      firstname: paymentData.firstname,
      email: paymentData.email,
      phone: paymentData.mobile,
      surl: `${host}/api/verify/${txnId}`,
      furl: `${host}/api/verify/${txnId}`,
      hash: hash,
      curl: `${host}/api/verify/${txnId}`, // Optional cancel URL
      udf1: paymentData?.userId, // Optional user defined fields
      udf2: paymentData?.billingCycle,
      udf3: paymentData?.product,
      udf4: '',
      udf5: '',
    };

    const response = await payuClient.paymentInitiate(paymentRequest);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('PayU Payment Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      },
      { status: 500 }
    );
  }
}

function generateHash(params: Record<string, string>, salt: string): string {
  const hashSequence = [
    params.key,
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    '', // udf1
    '', // udf2
    '', // udf3
    '', // udf4
    '', // udf5
    '', // udf6
    '', // udf7
    '', // udf8
    '', // udf9
    '', // udf10
    salt
  ];

  const hashString = hashSequence.join('|');
  return crypto.createHash('sha512').update(hashString).digest('hex');
}
