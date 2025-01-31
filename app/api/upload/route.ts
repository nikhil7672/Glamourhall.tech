import AWS from 'aws-sdk';
import sharp from 'sharp';
import { NextRequest } from 'next/server';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const files: any = formData.getAll('images');
  const filePaths = [];

  for (const file of files) {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Compress image
    const compressedImage = await sharp(fileBuffer)
    .resize({ 
      width: 800,  // Smaller width
      height: 600, // Smaller height
      fit: 'inside', 
      withoutEnlargement: true 
    })
    .webp({ 
      quality: 50,  // Lower quality
      nearLossless: true  // Balanced compression
    })
    .toBuffer();
    
    const params: any = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${Date.now()}-${file.name}`,
      Body: compressedImage,
      ContentType: 'image/webp',
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