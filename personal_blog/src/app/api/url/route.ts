import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Bucket } from 'sst/node/bucket';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import verifyJWT from '@/components/verifyCookies';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token');
  
  if (!token) {
    return NextResponse.json({ url: 'get out' }, { status: 401 });
  }
  
  try {
    let decoded = null;
    await verifyJWT(token.value, (err, decode) => {
        if (decode){
            decoded = decode;
        }
    });
    if (!decoded) {
      return NextResponse.json({ url: 'get out' }, { status: 401 });
    }

    const command = new PutObjectCommand({
      ACL: 'public-read',
      Key: crypto.randomUUID(),
      Bucket: Bucket.publix.bucketName,
    });

    const URL = await getSignedUrl(new S3Client({}), command);

    return NextResponse.json({ url: URL }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ url: 'an error occurred' }, { status: 500 });
  }
}
