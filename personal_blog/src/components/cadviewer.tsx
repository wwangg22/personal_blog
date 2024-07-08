'use client'
import React, {useState} from 'react';
import ThreeScene from './ThreeJsDemo';
import Menu from './Menu';


interface CADProps {
    initialPath: string[],
    models: string[],
    debug: boolean,
}

const CadViewer:React.FC<CADProps> = ({initialPath, models, debug}) => {  
    const [modelPath, setModelPath] = useState<string[]>(initialPath);
    console.log(models);
    return (
        <div>
            <Menu
            models = {models}
            modelPath={modelPath}
            setModelPath={setModelPath}
            debug = {debug}
            />
            <ThreeScene 
            debug = {debug}
            modelPath={modelPath}
            setModelPath={setModelPath}
            />
        </div>
    );
};
export default CadViewer;