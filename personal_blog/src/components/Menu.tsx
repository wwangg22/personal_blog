'use client'
import React from 'react';
import axios from 'axios';

interface versionProps {
    models: string[];
    modelPath: string[];
    setModelPath: React.Dispatch<React.SetStateAction<string[]>>;
    // modelRef: MutableRefObject<string[]>;
  }

const Menu: React.FC<versionProps> = ({models, modelPath, setModelPath}) => {
    const handleClick = () => {
        const menu = document.getElementById("menu");
        if (menu){
            if (menu.style.transform == 'translateX(-110%)'){
                menu.style.display = 'block';
                setTimeout(() => { 
                    menu.style.transform = 'translateX(0%)';
                }, 100);
                //menu.style.transform = 'translateX(0%)';
           
            }
            else {
                menu.style.transform = 'translateX(-110%)';
                setTimeout(() => {
                    if (menu.style.transform == 'translateX(-110%)'){
                        menu.style.display = 'none';
                    }
                }, 1000);
            }
            
        }
    }
    const getVersions = async (filepath:string) => {
        try {
            const response = await axios.get('/api/getFolders', { params: { folder: filepath } });
            return response.data.foldernames;
        } catch (error) {
            console.log(error);
        }
    }
    console.log(models);
    return (
        <>
            <div className="fixed top-[5%] z-30 w-[75px] h-[75px] rounded-xl bg-black cursor-pointer" 
            onClick={handleClick}
            style = {{
                left: 'calc(10% - 37.5px)'
            }}
            >
            <div className="grid grid-rows-7 w-full h-full">
            {Array.from({ length: 7 }).map((_, i) => (
                <div
                key={i}
                className={`h-[10px] ${i % 2 === 0 ?  'bg-black' : 'bg-white'} w-[75%] rounded-xl mx-auto`}
                ></div>
            ))}
            </div>
        </div>
        <div className="absolute h-full w-[20%] left-0 top-0 outline outline-1 outline-white bg-black transition-transform duration-1000 ease-in-out z-40" id="menu"
        style={{ transform: 'translateX(-110%)',
                display: 'none',
         }}
        >
            <div className="w-full h-full">
                <div className="grid auto-cols-min place-items-center relative w-full grid-cols-4 h-[10%] mt-[5%]">
                    <div></div>
                    <div className="col-span-2 text-3xl font-bold h-1/2 mt-1/2 flex flex-col justify-end h-24 cursor-pointer" onClick={handleClick}>
                        <h1>close</h1>
                    </div>
                    <div></div>
                </div>
            <div className="h-[10px] w-full bg-white">
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
                {models ? Array.from({ length: models.length }).map((_, i) => (
                    <div
                    key={i}
                    className={`h-[max(5vw,150px)] bg-white w-[75%] rounded-xl mx-auto`}
                    onClick = {async ()=>{ 
                        const folders = await getVersions(models[i]);
                        if (folders[0] != modelPath[0]){
                            console.log('setting new one');
                            setModelPath(folders);
                        }
                        
                    }}
                    >{models}</div>
                ))
                :
                <div></div>
            }
            </div>
            </div>
        </div>
      </>
      
    );
};

export default Menu;