import AWS from 'aws-sdk';
import { AnyAaaaRecord } from 'dns';
import { NextRequest } from 'next/server';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const POST = async (req:NextRequest) => {
  const formData = await req.formData();  // Parse incoming form data
  const files:any = formData.getAll('images'); // Get all uploaded files

  const filePaths = [];

  for (const file of files) {
    const fileContent = Buffer.from(await file.arrayBuffer()); // Convert file to buffer

    const params:any = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${Date.now()}-${file.name}`,
      Body: fileContent,
      ContentType: file.type,
      ACL: 'public-read',
    };

    try {
      const uploadResult = await s3.upload(params).promise();
      filePaths.push({ path: uploadResult.Location });
    } catch (error) {
     
      return new Response(`Error uploading to s3 ${error}`, { status: 500 });
    }
  }

  return new Response(JSON.stringify({ filePaths }), { status: 200 });
};
