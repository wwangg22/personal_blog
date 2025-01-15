
import React from 'react';
import Sign1 from "@/components/SignUp"
import Headers from '@/components/Headers';
import { cookies } from 'next/headers';



const SignupPage: React.FC = () => {
    const cookiesList = cookies();
    const myCookie = cookiesList.get('token');

    return (
        <main className="font-[ClashDisplay-Regular] bg-white w-full min-h-screen text-black">
            <Headers />
            <p>{myCookie ? `Cookie value: ${myCookie.value}` : 'Cookie not found'}</p>
            <Sign1/> 
        </main>
    );
};

export default SignupPage;