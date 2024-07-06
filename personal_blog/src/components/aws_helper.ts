import AWS from 'aws-sdk';
import { ListObjectsV2Request, ListObjectsV2Output } from 'aws-sdk/clients/s3';
import { Bucket } from "sst/node/bucket";
import { IncrementStencilOp } from 'three';


AWS.config.update({ region: 'us-east-1' }); // Change to your region

const s3 = new AWS.S3();

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