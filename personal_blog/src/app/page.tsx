import Image from "next/image";
import MatterJsDemo from "./components/MatterJsDemo";
import { Bucket } from "sst/node/bucket";
import {listS3ObjectUrls} from "./components/aws_helper";

export default async function Home() {
  const k = await listS3ObjectUrls('resume/', Bucket.publix.bucketName);
  //console.log("k", k ,Bucket.publix.bucketName);
  return (
    <main>
      <MatterJsDemo
      blocks={k}
      />
    </main>
  );
}
