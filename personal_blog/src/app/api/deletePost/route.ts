import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import verifyJWT from '@/components/verifyCookies';
import { Table } from 'sst/node/table';
import { DynamoDB } from 'aws-sdk'


AWS.config.update({ region: 'us-east-1' }); // Change to your region

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

    // console.log('id', body.blogid);
    const params = {
        TableName: Table.onetab.tableName, // Replace with your DynamoDB table name
        Key: {
            "PK": "BLOG",
            "SK": "BLOG#" + body.blogid// Replace with your GSI1SK value
        },
      };
  
      await dynamoDb.delete(params).promise();
  
      return NextResponse.json({ message: 'success' }, { status: 200 });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ message: 'an error occurred' }, { status: 500 });
    }
}
