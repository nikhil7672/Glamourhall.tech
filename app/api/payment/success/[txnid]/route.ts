import { NextResponse } from "next/server";
import PayU from "payu-websdk";

// Use the NextRequest type to access the request and params
export async function POST(req: Request, { params }: { params: { txnid: string } }) {
  try {
    const { txnid } = params; // Extract txnid from params

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;

    const payuClient = new PayU({
      key: merchantKey,
      salt: salt
    }, process.env.PAYU_ENVIRONMENT);

    // Verify the payment using your PayU client
    const verifiedData = await payuClient.verifyPayment(txnid);
    const data = verifiedData.transaction_details[txnid];

    // If the transaction is successful, redirect to the success page.
    if (data && data.status && data.status.toLowerCase() === "success") {
      return NextResponse.redirect(`${process.env.HOST}/payment/success/${txnid}`);
    } else {
      // Otherwise, redirect to the failure page.
      return NextResponse.redirect(`${process.env.HOST}/payment/failure/${txnid}`);
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    // Redirect to failure on error
    return NextResponse.redirect(`${process.env.HOST}/payment/failure/${txnid}`);
  }
}