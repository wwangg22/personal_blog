// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from "next/server";
import { getFolders } from "@/components/file_manager";
import { listS3ObjectFolders } from "@/components/aws_helper";

type Data = {
  message: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const folder = searchParams.get("folder");
  const local = searchParams.get("debug");
  // console.log('local', local);
  if (local == 'true' && typeof folder == "string"){
    var filenames: string[] = await getFolders(folder);
    return NextResponse.json({ foldernames: filenames }, { status: 200 });
  }
  else if (typeof folder === "string") {
    var filenames: string[] = await listS3ObjectFolders(folder);
    return NextResponse.json({ foldernames: filenames }, { status: 200 });
  }
}
