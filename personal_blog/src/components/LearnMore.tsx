'use client'
import React from 'react';
import InfoSVG from './InfoSVG';

interface LearnMoreProps {
    // Define the props for your component here
}
 
const LearnMore: React.FC<LearnMoreProps> = (props) => {
    // Implement your component logic here

    return (
        // JSX code for your component's UI goes here
        <div className="absolute top-1/2 left-[55%]">
            <div className="w-[150px] h-[150px] bg-white rounded-lg opacity-[0.3] flex items-center justify-center cursor-pointer hover:opacity-[0.7] transform -translate-y-1/2">
                <div className="text-black text-4xl font-[helvetica] font-bold text-center">i</div>
            </div>
        </div>
    );
};

export default LearnMore;