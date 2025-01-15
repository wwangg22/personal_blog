// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getFolders, getFiles } from "@/components/file_manager";
import { listS3ObjectUrls } from "@/components/aws_helper";

type Data = {
  message: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const folder = searchParams.get("folder");
  const local = searchParams.get("debug");
  console.log('local', local);
  
  if (local == 'true' && typeof folder == "string"){
    var filenames:string[] = await getFiles(folder);
    // console.log('filenames fdsf', filenames);
    return NextResponse.json({ filenames: filenames }, { status: 200})
  }

  else if (typeof folder == "string") {
    var filenames: string[] = await listS3ObjectUrls(folder);
    return NextResponse.json({ filenames: filenames }, { status: 200 });
  }

}
