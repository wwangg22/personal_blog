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
  //console.log('foler1', folder)
  if (typeof folder == "string") {
    var filenames: string[] = await listS3ObjectUrls(folder);
    console.log("filenames", filenames);
    return NextResponse.json({ filenames: filenames }, { status: 200 });
  }

  // console.log('folder', folder);

  // if (typeof folder === 'string'){
  //     var filenames:string[] = await getFiles(folder);
  //     console.log('filenames', filenames);
  //     return NextResponse.json({ filenames: filenames }, { status: 200})
  // }
}
