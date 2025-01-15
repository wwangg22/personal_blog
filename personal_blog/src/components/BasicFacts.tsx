'use client'
import React from 'react';
import DropdownSVG from './DropdownSVG';


interface BasicFactsProps {
    data: { [key: string]: any };
  }

const BasicFacts: React.FC<BasicFactsProps> = ({ data }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <div className = "absolute w-[25%] right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-start cursor-pointer">
            <div className = "w-full text-info_lg pl-6 flex justify-between items-center" onClick={()=>{setOpen(!open)}}>
                <div>Basic Facts</div>
                <div className={`transform transition-transform duration-300 ease-in-out ${open ? 'rotate-180' : 'rotate-0'}`}><DropdownSVG/></div>
            </div>
            <div
                className={`w-full transition-all duration-300 ease-in-out overflow-hidden ${open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                {(
                <div className="py-2">
                    {Object.entries(data).map(([key, value]) => (
                        value && 
                        <div key={key} className=" font-[helvetica] text-2xl mb-2 ml-10">
                            <strong>{key}: </strong> {value}
                        </div>
                    ))}
                </div>
                )}
            </div>

        </div>
    );
};

export default BasicFacts;
