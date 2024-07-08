'use client'
import React from 'react';

interface LoadingProps {
    // Add any props you need for the Loading component
}

const Loading: React.FC<LoadingProps> = () => {
    return (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] bg-black text-center flex items-center justify-center text-white text-4xl">
            Loading...
        </div>
    );
};

export default Loading;