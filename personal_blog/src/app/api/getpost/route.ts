// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from 'next/server';
import {getBlog} from '@/components/aws_helper'



export async function GET(
  req: NextRequest
) {
    const { searchParams } = new URL(req.url);
    
    const blogid = searchParams.get('blogid');
    if (blogid){
        const bloginfo = await getBlog(blogid);
        if (!bloginfo){
            return NextResponse.json({data: 'no blog exist'}, {status:400});
        }
        return NextResponse.json({ data: JSON.stringify(bloginfo)}, { status: 200})
    }
    else{
        return NextResponse.json({ data: 'not blogid'}, { status: 400})
    }
}
