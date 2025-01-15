import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { Bucket } from 'sst/node/bucket';
import verifyJWT from '@/components/verifyCookies';


AWS.config.update({ region: 'us-east-1' }); // Change to your region

const s3 = new AWS.S3();


export async function POST(req: NextRequest) {
  const token = req.cookies.get('token');
  const body = await req.json();
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

    // console.log('key', body.key);
    const params = {
        Bucket:Bucket.publix.bucketName,
        Key: body.key,
    };
    await s3.deleteObject(params).promise();


    return NextResponse.json({ message: 'success' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'an error occurred' }, { status: 500 });
  }
}
