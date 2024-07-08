// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from 'next/server';
import { getJsonObject } from '@/components/aws_helper'

type Data = {
  message: string,
}

export async function GET(
  req: NextRequest
) {
    const { searchParams } = new URL(req.url);
    
    const name = searchParams.get('name');

    // console.log('name', name);

    if (typeof name === 'string'){
        const description = await getJsonObject('descriptions', name);
        return NextResponse.json({ filenames: description }, { status: 200})
    }
}
