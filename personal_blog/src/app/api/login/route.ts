import bcrypt from "bcryptjs";
import { checkUserEmail } from "@/components/aws_helper";
import { NextRequest, NextResponse } from 'next/server';
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import cookie from "cookie";

// import {sign} from "@/components/login-flow/josemethods";
import { Config } from "sst/node/config";


type Data = {
  title: string;
  body?: string;
};
const expirationTime = 60 * 60 * 24;

const validateEmail = (email: String) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export async function POST(req: NextRequest) {
    try {
      const { email, password } = await req.json();

  
      const ck = await checkUserEmail(email);
      
      if (ck == undefined) {
        return NextResponse.json({ title: 'invalid credentials' }, { status: 401 });
      }
  
      const valid = await bcrypt.compare(password, ck!.password);
      if (!valid) {
        return NextResponse.json({ title: 'invalid credentials' }, { status: 401 });
      }
      const tokenData = {
        email: ck!.PK.split("#")[1],
      };
  
      const token = jwt.sign(tokenData, Config.JWT_SECRET_TOKEN, {
        expiresIn: expirationTime,
      });
  
      const response = NextResponse.json({ title: 'success' });
      response.headers.set(
        'Set-Cookie',
        cookie.serialize('token', token, {
          httpOnly: true,
          path: '/',
          maxAge: expirationTime,
        })
      );
  
      return response;
    } catch (err) {
      console.log(err);
      return NextResponse.json({ title: 'error' }, { status: 500 });
    }
  }
  