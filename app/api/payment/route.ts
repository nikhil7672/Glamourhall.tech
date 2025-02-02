export const dynamic = 'force-dynamic';  // Disable caching for this route
export const revalidate = 0;  // Disable revalidation


import { NextResponse } from 'next/server';
import crypto from 'crypto';
import PayU from "payu-websdk";

export async function POST(req: Request) {
  try {
    // Get the payment data from the request
    const paymentData = await req.json();

    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_SALT;

    if (!merchantKey || !salt) {
      throw new Error('Missing PayU credentials');
    }

    // Initialize PayU client
    const payuClient = new PayU({
      key: merchantKey,
      salt: salt
    }, );
    const txn_id='PAYU_MONEY_'+Math.floor(Math.random()*8888888)
    const { amount,product,firstname,email,mobile } =paymentData

//    let amount=233
//    let product = JSON.stringify({
//     name:'T-shirt',
//     price:233
//    })
//    let firstname='Krishna'
//    let email="harish@gmail.com"
//    let mobile = 2345678912

    let udf1 = ''
    let udf2 = ''
    let udf3 = ''
    let udf4 = ''
    let udf5 = ''

    const hashString = `${merchantKey}|${txn_id}|${amount}|${JSON.stringify(product)}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
    // console.log(hashString);
    

// Calculate the hash
const hash = crypto.createHash('sha512').update(hashString).digest('hex');

const data=    await payuClient.paymentInitiate({

    
            isAmountFilledByCustomer:false,
                txnid:txn_id,
                amount:amount,
                currency: 'INR',
                productinfo:JSON.stringify(product),
                firstname:firstname,
                email:email,
                phone:mobile,
                surl:`${process.env.HOST}/verify/${txn_id}`,
                furl:`${process.env.HOST}/verify/${txn_id}`,
                hash
    

    }) 
    return NextResponse.json({ 
      success: true, 
      data: data 
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

function generateHash(data: any, salt: string): string {
    const hashString = [
      data.key,
      data.txnid,
      data.amount,
      data.productinfo,
      data.firstname,
      data.email,
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
    ].join('|');
  
    return crypto.createHash('sha512').update(hashString).digest('hex');
  }

// Add input validation middleware if needed
export async function validatePaymentInput(paymentData: any) {
  const requiredFields = ['amount', 'email', 'productInfo', 'firstname', 'mobile'];
  
  for (const field of requiredFields) {
    if (!paymentData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
    throw new Error('Invalid amount');
  }

  if (!paymentData.email.includes('@')) {
    throw new Error('Invalid email format');
  }

  return true;
}