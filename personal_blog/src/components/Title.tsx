'use client'
import React from 'react';

interface TitleProps {
    text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => {
    return (<div className = "absolute top-0 left-0 w-full h-[20%] flex items-center justify-center">
        <div className="text-title_large">{text}</div>
    </div>);
};

export default Title;