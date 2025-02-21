import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

export async function POST(request: Request) {
  const pollyClient = new PollyClient({
    region: process.env.AWS_REGION || 'eu-north-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });

  try {
    const { text, voice = 'Joanna' } = await request.json();
    
    if (!text) return NextResponse.json(
      { error: 'Text is required' }, 
      { status: 400 }
    );

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voice,
      TextType: 'text'
    });

    const response = await pollyClient.send(command);
    
    if (!response.AudioStream || !(response.AudioStream instanceof Readable)) {
      return NextResponse.json(
        { error: 'Invalid audio stream format' },
        { status: 500 }
      );
    }

    const stream = response.AudioStream;
    const chunks: Uint8Array[] = [];

    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    return new Response(Buffer.concat(chunks), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="audio.mp3"',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
    
  } catch (error) {
    console.error('Polly error:', error);
    return NextResponse.json(
      { error: 'Speech synthesis failed' },
      { status: 500 }
    );
  }
}