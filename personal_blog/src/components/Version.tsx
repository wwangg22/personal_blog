import React, { useEffect,MutableRefObject } from 'react';

interface Props {
    value: number;
    sharedState: number;
    setSharedState: React.Dispatch<React.SetStateAction<number>>;
    sharedRef: MutableRefObject<number>;
}

const Version: React.FC<Props> = ({ value, sharedState, setSharedState, sharedRef}) => {
    const handleClick = (num: number) => {
        setSharedState(num);
    }
    const handleResize = () => {
        handleClick(sharedRef.current);
    }
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, []);
    useEffect(() => {
        var slider = document.getElementById("slider");
        var trail = document.getElementById("trail");
        if (slider && trail){
            slider.style.left = `${sharedState * 100}%`;
            trail.style.width = `${sharedState*100}%`;
        }
    }, [sharedState]);
    
    return (
        <div className= "fixed w-1/2 z-30 bottom-[10%] left-1/2 transform -translate-x-1/2 text-white" 
        style = {{touchAction: "none"}}>
            <div className={"grid auto-cols-min min-h-0 min-w-0 place-items-center relative w-full"}
            style = {
                        {
                            gridTemplateColumns: `repeat(${value}, 1fr)`,
                        }
                    }             
            >
            {Array.from({ length: value }, (_, i) => (
            <div className="relative flex h-full w-full items-center justify-center">
                {
                i === 0 ? (
                    <>
                    <div className="absolute h-full w-full grid grid-cols-[1fr_max-content_1fr] place-content-center justify-items-center font-bold text-3xl">                 
                        <div></div>
                        <div className="ml-[0.5rem] mr-[0.5rem] z-30" id="width2" onClick = {()=>{handleClick(i)}}
                        style = {{
                            cursor: "pointer"
                        }}
                            >V{i+1}</div>
                        {
                            value === 1 ? (
                                <div></div>
                            ):(
                                <div className="bg-black self-center h-[5px] w-full" id="width"></div>    
                            )
                        }
                              
                    </div>
                    <div className = "1"
                    style = {{
                        position: "relative",
                        left: "0px",
                        backgroundColor: "green",
                        height: "2.5rem",
                        width: "2.5rem",
                        transitionProperty: "left",
                        transitionTimingFunction: "cubic-bezier(0,0,.2,1)",
                        transitionDuration: "1s",
                        zIndex: 1,
                    }}
                    id="slider"
                    >
                    </div>
                    <div id="trail"
                    style = {{
                        position: "absolute",
                        left: "50%",
                        backgroundColor: "green",
                        height: "10px",
                        width: "0px",
                        transitionProperty: "width",
                        transitionTimingFunction: "cubic-bezier(0,0,.2,1)",
                        transitionDuration: "1s",
                        zIndex: 1,
                    }}
                    >
                    </div>
                    </>
                ):
                (
                    <div className="absolute h-full w-full grid grid-cols-[1fr_max-content_1fr] place-content-center justify-items-center font-bold text-3xl">
                    {i === value-1 ? ( // Example condition for the second option
                            <>
                            <div className="bg-black self-center h-[5px] w-full"></div>
                            <div className="ml-[0.5rem] mr-[0.5rem] z-30" onClick = {()=>{handleClick(i)}}
                               style = {{
                                cursor: "pointer"
                            }}
                                >V{i+1}</div>
                            <div></div>
                            </>
                        ) : ( // Default condition for the third option
                            <>
                                <div className="bg-black self-center h-[5px] w-full"></div>
                                <div className="ml-[0.5rem] mr-[0.5rem] z-30" onClick = {()=>{handleClick(i)}}
                                   style = {{
                                    cursor: "pointer"
                                }}
                                    >V{i+1}</div>
                                <div className="bg-black self-center h-[5px] w-full"></div>
                            </>
                        )}
                    </div>
                )
                }
              </div>
            ))}  
            </div>
        </div>
    );
};

export default Version;