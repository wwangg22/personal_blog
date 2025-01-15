import { NextRequest, NextResponse } from 'next/server';
import {Table} from "sst/node/table"
import { DynamoDB } from 'aws-sdk'
import crypto from 'crypto'
import verifyJWT from '@/components/verifyCookies'

const dynamoDb = new DynamoDB.DocumentClient();

type Data = {
    name: string,
  }
  type prms = {
      title: string,
      author: string,
      text?: string, 
      images?: [string],
      image: string,
      date?: any
  }
  type itemprms = {
      PK: string,
      SK: string,
      title: string,
      author: string,
      metadata?: string,
      text?: string, 
      images?: [string],
      image: string,
      rawHTML?:string,
      date: any
  }

const getCurCount = async () =>{
    const queryparams = {
      TableName: Table.onetab.tableName,
      KeyConditionExpression: "PK = :pk and SK = :sk",
      ExpressionAttributeValues: {
          ":pk": "blogidcounter",// Partition key value for blogs
          ":sk" : "blogidcounter"
      },
      ProjectionExpression: "#count", // Use an alias for the reserved word
      ExpressionAttributeNames: {
          "#count": "count" // Define the alias
      }
      };
      try {
          const results = await dynamoDb.query(queryparams).promise();
          console.log("Query succeeded:", results);
          if (results.Items && results.Items.length > 0 && 'count' in results.Items[0]) {
            return results.Items[0].count;
          } else {
            // Handle the case when the structure doesn't match your expectations
            // For example, return a default value or throw an error
            return; // Replace with an appropriate default value
          }
      } catch (error) {
          console.error("Error querying DynamoDB:", error);
      }
}

const updateCurCount = async ()=>{
    const params = {
        TableName: Table.onetab.tableName,
        Key: {
            PK: "blogidcounter",
            SK: "blogidcounter"
        },
        UpdateExpression: "set #cnt = #cnt + :incr",
        ExpressionAttributeValues: {
            ":incr": 1
        },
        ExpressionAttributeNames: {
            "#cnt": "count" // Alias for the 'count' attribute
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const result = await dynamoDb.update(params).promise();
        console.log("Update succeeded:", result);
    } catch (error) {
        console.error("Error updating DynamoDB:", error);
    }
}
function padNumber(num: number, size: number) {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
const store = async (json: prms) => {
    var count = await getCurCount();
    if (count == undefined){
        return
    }
    const id = "BLOG#" + padNumber(count, 6);

    // Build your DynamoDB item
    let item:itemprms = {
        PK: "BLOG",
        SK: id,
        title: json.title,
        author:json.author,
        date: json.date,
        image: json.image,
        text: json.text
    }

    // Add optional fields if they exist

    var params = {
        TableName: Table.onetab.tableName,
        Item: item // Use the item object
    }

    dynamoDb.put(params, function (err, data) {
        if (err) {
            console.log('error', err);
            return err;
        } else {
            console.log('data', data);
            updateCurCount();
            return data;
        }
    });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    console.log(req);
    const token = req.cookies.get('token') || '';
    if (!token) {
        return NextResponse.json({ url: 'get out' }, { status: 401 });
      }
    // Verify JWT here (replace verifyJWT with your actual JWT verification logic)
    let decode = null;

    await verifyJWT(token.value, (err,decoded) => {
        console.log('decdored = ', decoded);
        decode = decoded;
    }); // Assume this function verifies the JWT
    console.log(decode);
    if (!decode) {
      return NextResponse.json({ name: 'forbidden' }, { status: 401 });
    }
  
    const j = new Date().toUTCString();
    const k = {
      title: body.title,
      author: body.author,
      text: body.text,
      image: body.images[0],
      date: j,
    };
    console.log('k', k);
    await store(k);
    return NextResponse.json({ name: 'success' });
  }