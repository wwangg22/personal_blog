'use client'
import React, { RefObject, useEffect, useState } from 'react';
import axios from 'axios';

interface versionProps {
    models: string[];
    modelPath: string[];
    setModelPath: React.Dispatch<React.SetStateAction<string[]>>;
    debug: boolean;
    mobileRef: RefObject<boolean>;
    // modelRef: MutableRefObject<string[]>;
  }

const Menu: React.FC<versionProps> = ({models, modelPath, setModelPath, debug, mobileRef}) => {
    console.log(models);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
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
    const autoClose = (event: MouseEvent) => {
        const menu = document.getElementById("menu");
        if (menu){
            const rect = menu.getBoundingClientRect();
            const isInsideMenu = event.clientX >= rect.left &&
                                event.clientX <= rect.right &&
                                event.clientY >= rect.top &&
                                event.clientY <= rect.bottom;
            if (!isInsideMenu) {
                menu.style.transform = 'translateX(-110%)';
                setTimeout(() => {
                    if (menu.style.transform == 'translateX(-110%)'){
                        menu.style.display = 'none';
                    }
                }, 1100);
            }   
        }
    }   
    const getVersions = async (filepath:string) => {
        try {
            const response = await axios.get('/api/getFolders', { params: { folder: filepath, debug: debug } });
            return response.data.foldernames;
        } catch (error) {
            console.log(error);
        }
    }
    const getThumbnails = async () => {
        try{
            const response = await axios.get('/api/getFiles', { params: { folder: 'thumbnails/', debug: debug } });
            return response;
        }catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        window.addEventListener('click', autoClose);
        getThumbnails().then((response) => {
            console.log(response?.data.filenames);
            setThumbnails(response?.data.filenames);
        });
        return () =>{
            window.removeEventListener('click', autoClose);
        }
    }, []);
    return (
        <>
            <div className="fixed top-[15%] lg:top-[5%] z-30 w-[75px] h-[75px] rounded-xl bg-black cursor-pointer" 
            
            onClick={handleClick}
            style = {{
                left: 'calc(10% - 37.5px)',
                touchAction: "none"
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
        <div className="absolute h-full w-menu left-0 top-0 outline outline-1 outline-white bg-black transition-transform duration-1000 ease-in-out z-40" id="menu"
        style={{ transform: 'translateX(-110%)',
                display: 'none',
                touchAction: "none",
                overflow: "hidden",
         }}
        >
            <div className="w-full h-full">
                <div className="grid auto-cols-min place-items-center relative w-full grid-cols-4 h-[10%] mt-[5%]">
                    <div></div>
                    <div className={`col-span-2 text-white text-3xl font-bold cursor-pointer ${mobileRef.current ? 'my-auto' : 'h-1/2 flex flex-col h-24 justify-end  mt-1/2'}`} onClick={handleClick}>
                        <h1>close</h1>
                    </div>
                    <div></div>
                </div>
            <div className="h-[10px] w-full bg-white">
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 text-white">
            {models && models.length > 0 ? models.map((model, i) => {
                const modelName = model.split("/").filter(Boolean).slice(-1)[0];

                const thumbnail = thumbnails.find(t => t.includes(`${modelName.toLowerCase()}.png`));

                
                
                return (
                <div
                    key={i}
                    className={`w-menuitem rounded-xl mx-auto cursor-pointer flex flex-col items-stretch p-[5px] hover:bg-[green]`}
                    onClick={async () => { 
                    const menu = document.getElementById("menu");
                    if (menu){
                        menu.style.transform = 'translateX(-110%)';
                        setTimeout(() => {
                        if (menu.style.transform === 'translateX(-110%)'){
                            menu.style.display = 'none';
                        }
                        }, 1000);
                    }
                    
                    const folders = await getVersions(model);
                    if (folders[0] !== modelPath[0]){
                        console.log('setting new one');
                        setModelPath(folders);
                    }
                    
                    }}
                >
                    {!debug && thumbnail && (
                    <img 
                        src={thumbnail} 
                        alt={`Thumbnail for ${modelName}`} 
                        className="w-full h-auto object-cover rounded-xl"
                    />
                    )}
                    <div className="text-center">
                    {modelName}
                    </div>
                    </div>
                    );
                }) : <div></div>}
                </div>

            </div>
        </div>
      </>
      
    );
};

export default Menu;