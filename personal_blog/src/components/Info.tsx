'use client'
import React, {useState, useEffect, RefObject, useRef} from 'react';
import axios from 'axios';

interface InfoProps {
    title: string;
    mobileRef: RefObject<boolean>;
    unMount: boolean;
};
type Description = {
    title: string;
    purpose: string;
    design: string;
}

const Info: React.FC<InfoProps> = ({title, mobileRef, unMount}) => {
    const [description, setDescription] = useState<Description |null>(null);
    const eleRef = useRef<HTMLDivElement>(null);
    useEffect(() =>{
        setTimeout(()=> {
            eleRef.current?.classList.add("opacity-100");
        }, 100);
        axios.get('/api/getDescription', { params: { name: title.split("/")[title.split("/").length - 1].split(".")[0] + ".json" } }).then((response) => {
            setDescription(response.data.filenames as Description);
        });

    },[]);

    useEffect(()=>{
        if (unMount){
            eleRef.current?.classList.remove("opacity-100");
            eleRef.current?.classList.add("opacity-0");
        }
    },[unMount])
    if (!mobileRef.current){
        return (

            <div className="absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out opacity-0"
            ref = {eleRef}
            >
                <div className="grid grid-cols-[max-content_max-content_1fr_max-content_max-content] grid-rows-[1fr_max-content_1fr] pt-[5%] w-full h-full">
                    <div className="col-start-1 row-start-2 w-[4rem] grid grid-rows-2">
                        <div></div>
                        <div></div>
                        {/* <div className = "h-[1px] w-full m-auto bg-white"></div>
                        <div className = "h-[1px] w-full m-auto bg-white"></div> */}
                    </div>
                    <div className="col-start-2 row-start-2 w-[30vw] min-h-[50vh]"></div>
                    {/* <div className="col-start-2 row-start-2 w-[30vw] min-h-[50vh] outline outline-1 outline-white"
                    style={{
                        backgroundColor: 'rgba(128,128,128,0.3)',
                    }}>
                    </div> */}
                    <div className = "col-start-2 row-start-3">
                        <div></div>
                        {/* <div className = "w-[1px] h-full m-auto bg-white"></div> */}
                    </div>
                    <div className="col-start-5 row-start-2 w-[4rem] grid grid-rows-2">
                        <div className = "h-[1px] w-full m-auto bg-white"></div>
                        <div className = "h-[1px] w-full m-auto bg-white"></div>
                    </div>
                    <div className="col-start-4 row-start-2 w-[30vw] min-h-[50vh] outline outline-1 outline-white font-[helvetica] p-5"
                    style={{
                        backgroundColor: 'rgba(128,128,128,0.3)',
                    }}
                    >
                        <h1 className="text-3xl text-center text-white font-bold">
                            {description? 'Purpose:' : ''}
                        </h1>
                        <div className="h-[10px]"> </div>
                        <div className="text-lg">
                        {description ? description["purpose"] : ""}
                        </div>
                        <div className="h-[10px]"> </div>
                        <h1 className="text-3xl text-center text-white font-bold">
                        {description? 'Design Elements:' : ''}
                        </h1>
                        <div className="h-[10px]"> </div>
                        <div className="text-lg">
                        {description ? description["design"] : ""}
                        </div>
    
                    </div>
                    <div className = "col-start-4 row-start-3">
                        <div className = "w-[1px] h-full mx-auto bg-white"></div>
                    </div>
                    
                    <div className="col-start-3 row-start-3 text-title_large text-center">
                        {description ? description["title"] : ""}
                    </div>
            </div>
        </div>
        );
    }
    else{
        return (
            <div className="absolute w-[80%] left-1/2 transform -translate-x-1/2 top-[50%] outline outline-1 outline-white font-[helvetica] h-[30%] overflow-auto text-white"
            style={{
                backgroundColor: 'rgba(0,0,0,0.8)',
            }}>
                 <h1 className="text-lg text-center text-white font-bold">
                            {description? 'Purpose:' : ''}
                        </h1>
                        <div className="h-[10px]"> </div>
                        <div className="text-sm">
                        {description ? description["purpose"] : ""}
                        </div>
                        <div className="h-[10px]"> </div>
                        <h1 className="text-lg text-center text-white font-bold">
                        {description? 'Design Elements:' : ''}
                        </h1>
                        <div className="h-[10px]"> </div>
                        <div className="text-sm">
                        {description ? description["design"] : ""}
                        </div>
            </div>
        )
    }
    
};

export default Info;