import { NextRequest } from 'next/server';
import PayU from 'payu-websdk';

export async function POST(
  request: NextRequest,
  { params }: { params: { txnid: string } }
) {
  try {
    const { txnid } = params; // Extract txnid from params

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;

    const payuClient = new PayU({
      key: merchantKey,
      salt: salt
    }, process.env.PAYU_ENVIRONMENT);
    const verified_Data = await payuClient.verifyPayment(params.txnid);
    const data = verified_Data.transaction_details[params.txnid];

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