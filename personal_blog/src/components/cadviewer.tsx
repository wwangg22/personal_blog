'use client'
import React, {useState} from 'react';
import ThreeScene from './ThreeJsDemo';
import Menu from './Menu';


interface CADProps {
    initialPath: string[],
    models: string[],
}

const CadViewer:React.FC<CADProps> = ({initialPath, models}) => {  
    const [modelPath, setModelPath] = useState<string[]>(initialPath);
    console.log(models);
    return (
        <div>
            <Menu
            models = {models}
            modelPath={modelPath}
            setModelPath={setModelPath}
            />
            <ThreeScene 
            modelPath={modelPath}
            setModelPath={setModelPath}
            />
        </div>
    );
};
export default CadViewer;