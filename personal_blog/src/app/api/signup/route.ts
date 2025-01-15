import { NextRequest, NextResponse } from 'next/server';
import verifyJWT from "@/components/verifyCookies";
import bcrypt from "bcryptjs";
import { addNewUser } from '@/components/aws_helper';
import { checkUserEmail } from '@/components/aws_helper';
import cookie from "cookie";

export async function POST(req: NextRequest) {
    try {
      const { email, password } = await req.json();
      // console.log(email, password);
  
      if (!email || !password) {
        return NextResponse.json({ title: 'invalid fields' }, { status: 400 });
      }
  
      const ck = await checkUserEmail(email);
      if (ck) {
        return NextResponse.json({ title: 'email exists' }, { status: 400 });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const newUser = await addNewUser(hashedPassword, email);
  
      return NextResponse.json({ title: email, body: 'hey' }, { status: 200 });
  
    } catch (err) {
      console.error(err);
      return NextResponse.json({ title: 'Server Error', body: 'An error occurred on the server.' }, { status: 500 });
    }
  }