
import React from 'react';
import Sign1 from "@/components/SignUp"
import Headers from '@/components/Headers';
import { cookies } from 'next/headers';
import verifyJWT from '@/components/verifyCookies';
import RichTextEditor from '@/components/RichTextEditor';



const WritePage: React.FC = async () => {
    const cookiesList = cookies();
    const myCookie = cookiesList.get('token');
    let valid= false;
    let email = '';
    if (myCookie) {
        // console.log('checking')
        await verifyJWT(myCookie.value,(err, decoded)=>{
            if (err) {
                console.log(err)
            }
            else {
                // console.log('decoded', decoded)
                if (decoded){
                    email = (decoded as any).email;
                    // console.log(email);
                    valid = true;
                }
                
        }
        });
    }

    if(valid){
        return (
            <main className="font-[ClashDisplay-Regular] bg-white w-full min-h-screen text-black">
                <Headers />
                <RichTextEditor
                email = {email}
                />
            </main>
        );
    }
    else{
        return (
            <div>not meant for your eyes</div>
        )
    }

    
};

export default WritePage;