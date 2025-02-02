// app/api/failure/[txnid]/route.js
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { txnid: string } }) {
  const { txnid } = params;

  // Optionally, log the failure details
  try {
    const body = await req.json();
    console.error("Payment failed for txnid:", txnid, body);
  } catch (error) {
    console.error("Error parsing failure details for txnid:", txnid, error);
  }

  // Redirect to the failure page on your front end
  return NextResponse.redirect(`${process.env.HOST}/payment/failure/${txnid}`);
}
