// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { getJsonObject } from '@/components/aws_helper'

type Data = {
  message: string,
}

export async function GET(
  req: NextRequest
) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const debug = searchParams.get('debug'); 

    // console.log('name', name);
    if (debug === 'true' && typeof name === 'string'){
      const directoryPath = path.join(process.cwd(), '/public/descriptions', name);

      const fileContents = fs.readFileSync(directoryPath, 'utf-8');
    const parsedJson = JSON.parse(fileContents);
    return NextResponse.json({ data: parsedJson }, { status: 200 });
    }
    else if (typeof name === 'string'){
        const description = await getJsonObject('descriptions', name);
        return NextResponse.json({ filenames: description }, { status: 200})
    }
}
