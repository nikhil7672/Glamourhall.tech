import multer from 'multer';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import path from 'path';
import { promises as fs } from 'fs';

// ... storage config remains same ...

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePaths = await Promise.all(
      files.map(async (file: any) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.name);
        const filepath = path.join(uploadDir, filename);
        
        await fs.writeFile(filepath, buffer);
        
        return {
          path: `/uploads/${filename}`,
          originalName: file.name,
          size: file.size,
          mimetype: file.type
        };
      })
    );

    return NextResponse.json({ filePaths }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading files' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';