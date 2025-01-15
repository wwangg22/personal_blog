import React from 'react';
import { getBlog } from '@/components/aws_helper';
import axios from 'axios';
import { cookies } from 'next/headers';
import Headers from '@/components/Headers';
import verifyJWT from '@/components/verifyCookies';
import Blog from '@/components/Blog';


const Home: React.FC<{params:{slug:string}}> = async ({params}) => {
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

    const response = await getBlog(params.slug as string);
    const rawhtmld = await axios.get(response?.text);
    const url = new URL(response?.text);


    const rawhtml = {'text':rawhtmld.data, 'title':response?.title, 'blurb':response?.blurb, 'image': response?.image};
    return (
        <Blog
        verified = {valid}
        slug = {params.slug}
        rawhtml={rawhtml}
        ky = {url.pathname.split('/')[1]}
        />
    )
};

export default Home;