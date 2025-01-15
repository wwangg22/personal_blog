import AWS from 'aws-sdk';
import { ListObjectsV2Request, ListObjectsV2Output } from 'aws-sdk/clients/s3';
import { Bucket } from "sst/node/bucket";
import { DynamoDB } from 'aws-sdk'
import { Table } from "sst/node/table"
import { DocumentClient } from 'aws-sdk/clients/dynamodb';


const dynamoDb = new DynamoDB.DocumentClient();


AWS.config.update({ region: 'us-east-1' }); // Change to your region

const s3 = new AWS.S3();

export const store = async (startKey?: string) => {
  let params: DocumentClient.QueryInput = {
      TableName: Table.onetab.tableName,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
          ":pk": "BLOG" // Partition key value for blogs
      },
      ScanIndexForward: false,
      Limit: 5,
  };

  // If a startKey is provided, add it to the query parameters
  if (startKey) {
      params.ExclusiveStartKey = {
          PK: "BLOG",
          SK: startKey
      };
  }

  try {
      const results = await dynamoDb.query(params).promise();
      return { items: results.Items, lastEvaluatedKey: results.LastEvaluatedKey };
  } catch (error) {
      console.error("Error querying DynamoDB:", error);
      return;
  }
}

export async function listS3ObjectUrls(folderName: string): Promise<string[]> {
    const params = {
      Bucket: Bucket.publix.bucketName,
      Prefix: folderName,
    };
  
    try {
      const data = await s3.listObjectsV2(params).promise();
      //console.log(data);
      const urls = data.Contents?.filter(item => {
        const key = item.Key || '';
        if (key.endsWith('/')) return; // Exclude directories
        return key
      }).map(item => {
        const key = item.Key || '';
        return `https://${Bucket.publix.bucketName}.s3.amazonaws.com/${key}`;
      }) ?? [];
      return urls;
    } catch (err) {
      console.error('Error fetching object URLs from S3:', err);
      throw err;
    }
  }

  export async function listS3ObjectFolders(folderName: string): Promise<string[]> {
    const params = {
      Bucket: Bucket.publix.bucketName,
      Prefix: folderName.endsWith('/') ? folderName : folderName + '/',
      Delimiter: '/',
    };
  
    try {
      const data = await s3.listObjectsV2(params).promise();
      const folders = data.CommonPrefixes?.map(item => {
        return item.Prefix || ''
      }).filter(item => {
        const key = item;
        if (!key.endsWith('/')) return;
        return key;
      }) ?? [];

      // const urls = data.Contents?.filter(item => {
      //   const key = item.Key || '';
      //   if (!key.endsWith('/')) return; // Exclude directories
      //   return key;
      // }).map(item => {
      //   const key = item.Key || '';
      //   return key;
      // }) ?? [];
      return folders;
    } catch (err) {
      console.error('Error fetching object URLs from S3:', err);
      throw err;
    }
  }
  export const getBlog = async(blogid:any) => {
    var params = {
        TableName: Table.onetab.tableName,
        Key: {
            "PK": "BLOG",
            "SK": "BLOG#" + blogid// Replace with your GSI1SK value
        },
        // Optional - ProjectionExpression: "Attribute1, Attribute2, Attribute3"
    };

    try {
        const data = await dynamoDb.get(params).promise();
        if (data.Item) {
            console.log("GetItem succeeded:");
            // console.log("data: ", data.Item)
            return data.Item;
        } else {
            console.log("Item not found");
            return;
        }
    } catch (err) {
        console.error("Unable to get item. Error JSON:");
        return;
    }

    
}

  export async function getJsonObject(folderName: string, fileName: string): Promise<any> {
    const params = {
        Bucket: Bucket.publix.bucketName,
        Key: `${folderName}/${fileName}`,
    };
    try {
        const data = await s3.getObject(params).promise();
        const json = data.Body?.toString('utf-8');
        return JSON.parse(json || '{}');
    } catch (err) {
        console.error('Error fetching JSON object from S3:', err);
        throw err;
    }
}
export async function checkUserEmail(email:string) {
  var params = {
      TableName: Table.onetab.tableName,
      Key: {
          "PK": "USER#" + email, // Replace with your GSI1PK value
          "SK": "USER#" + email  // Replace with your GSI1SK value
      },
      // Optional - ProjectionExpression: "Attribute1, Attribute2, Attribute3"
  };

  try {
      const data = await dynamoDb.get(params).promise();
      if (data.Item) {
          console.log("GetItem succeeded:", JSON.stringify(data.Item, null, 2));
          return data.Item;
      } else {
          console.log("Item not found");
          return;
      }
  } catch (err) {
      console.error("Unable to get item. Error JSON:", JSON.stringify(err, null, 2));
      return;
  }

  
}

interface UserItem {
  PK: string;
  SK: string;
  password: string;
  [key: string]: string;  // Allows for additional properties
}

export async function addNewUser(password:string, email:string, name:string | null = null) {

  let items:UserItem = {
          PK: "USER#" + email,
          SK: "USER#" + email,
          password: password,
  }
  if (name) {
      items.name = name;
  }
  let params = {
      TableName: Table.onetab.tableName,
      Item: items
  }

  try{
      await dynamoDb.put(params
          ,function (err,data){
          if (err){
              console.log('error',err)
              return err;
          }
          else{
              console.log('data',data)
              return data;
          }
      }
  )
  }
  catch(err){
      console.log('error',err)
      return err;
  }

  
}
