
import React from 'react';
import Login from '@/components/Login'
import Headers from '@/components/Headers';


const LoginPage: React.FC = () => {

    return (
        <main className="font-[ClashDisplay-Regular] bg-white w-full h-min-screen text-black dark:text-white dark:bg-black">
            <Headers />
            <Login/>
        </main>
    );
};

export default LoginPage;