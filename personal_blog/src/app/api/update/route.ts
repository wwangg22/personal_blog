import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Table } from 'sst/node/table';
import { DynamoDB } from 'aws-sdk'
import verifyJWT from '@/components/verifyCookies';

const dynamoDb = new DynamoDB.DocumentClient();


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

    const dynamoParams = {
        TableName: Table.onetab.tableName,
        Key: { 
            "PK": "BLOG",
            "SK": "BLOG#" + body.blogid
         },
         UpdateExpression: 'set #text = :text, #image = :image',
         ExpressionAttributeNames: {
             '#text': 'text',
             '#image': 'image',
         },
         ExpressionAttributeValues: {
             ':text': body.text,
             ':image': body.image,
         },
         ReturnValues: 'UPDATED_NEW',
    };

    await dynamoDb.update(dynamoParams).promise();

    return NextResponse.json({ message: 'success' }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'an error occurred' }, { status: 500 });
  }
}
