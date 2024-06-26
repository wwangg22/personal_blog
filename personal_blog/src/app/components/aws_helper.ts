import AWS from 'aws-sdk';
import { ListObjectsV2Request, ListObjectsV2Output } from 'aws-sdk/clients/s3';


AWS.config.update({ region: 'us-east-1' }); // Change to your region

const s3 = new AWS.S3();

export async function listS3ObjectUrls(folderName: string, bucketName: string): Promise<string[]> {
    const params = {
      Bucket: bucketName,
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
        return `https://${bucketName}.s3.amazonaws.com/${key}`;
      }) ?? [];
      return urls;
    } catch (err) {
      console.error('Error fetching object URLs from S3:', err);
      throw err;
    }
  }