// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from 'next/server';

import { store } from "@/components/aws_helper"

export async function GET(
  req: NextRequest
) {
    const { searchParams } = new URL(req.url);
    
    const startKey = searchParams.get('startkey');

    const results = await store(startKey ? String(startKey) : undefined);
    // console.log(results?.lastEvaluatedKey);
    
    return NextResponse.json({ data: JSON.stringify(results?.items), lastEvaluatedKey: JSON.stringify(results?.lastEvaluatedKey)}, { status: 200})

}
