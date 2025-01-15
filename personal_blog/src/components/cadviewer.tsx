'use client'
import React, {useState, useRef, useEffect} from 'react';
import ThreeScene from './ThreeJsDemo';
import Link from 'next/link';
import Menu from './Menu';


interface CADProps {
    initialPath: string[],
    models: string[],
    debug: boolean,
}

const CadViewer:React.FC<CADProps> = ({initialPath, models, debug}) => {  
    const [modelPath, setModelPath] = useState<string[]>(initialPath);
    const mobileRef = useRef(false);
    // console.log(models);
    useEffect(()=>{
        mobileRef.current = window.matchMedia("(max-width: 1024px)").matches;
    },[])
    return (
        <div className="text-white">
            <Menu
            models = {models}
            modelPath={modelPath}
            setModelPath={setModelPath}
            debug = {debug}
            mobileRef = {mobileRef}
            />
            <ThreeScene 
            models = {models}
            debug = {debug}
            modelPath={modelPath}
            setModelPath={setModelPath}
            mobileRef = {mobileRef}
            />
            <Link href="/" className={`fixed top-[15%] flex z-30 lg:top-[5%] h-[75px] cursor-pointer lg:items-end tit1`}
            style={{
                right: 'calc(10% - 37.5px)',
            }}>
                Main Menu
            </Link>
        </div>
    );
};
export default CadViewer;