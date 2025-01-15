// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextRequest, NextResponse } from 'next/server';
import verifyJWT from "@/components/verifyCookies";
import cookie from "cookie";



type Data = {
  message: string,
}

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
  
    if (!token) {
      return NextResponse.json({ message: 'No token found' }, { status: 400 });
    }
  
    verifyJWT(token, (err, decoded) => {
      const response = NextResponse.json({ message: 'logged out successfully' });
  
      response.headers.set(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          path: '/',
          maxAge: -60,
        })
      );
  
      return response;
    });
  }