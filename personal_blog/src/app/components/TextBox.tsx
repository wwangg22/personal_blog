import React from 'react';
import { ReactSVG } from 'react-svg';

interface TextBoxProps {
  text: string;
  x: number;
  y: number;
  rotation: number; // Rotation in degrees
  offset: number;
  title: string;
}

const TextBox: React.FC<TextBoxProps> = ({ text, x, y, rotation, offset, title}) => {
    var svg_height = 843;
    var svg_width = 628.48;
    console.log("window height", window.innerHeight );
    if (x < 0.5){
        svg_width *= -1;
    }
  return (
    <>
        <div 
        className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
            left: `calc(${x*100}% + ${svg_width/2}px)`, 
            top: `calc(50% + ${offset}px)`,
            pointerEvents: "none",
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scaleY(${window.innerHeight / svg_height})`, // Apply rotation here
        }}
        >
            <ReactSVG src={"/box.svg"} />
        </div>
        <div 
        className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
            left: `calc(${x*100}%)`, 
            top: `calc(${y*100}% + ${offset}px)`,
            pointerEvents: "none",
            transform: `translate(-50%, -50%) rotate(${rotation}deg) scaleY(${window.innerHeight / svg_height})`, // Apply rotation here
        }}
        >
        <ReactSVG src={"/tail.svg"} />
        </div>
        <div 
        className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 text-black text-title_large font-universal-jack font-bold "
        style={{ 
            left: `calc(${x*100}% + ${svg_width/2}px)`, 
            top: `calc(10% + ${offset}px)`,
            pointerEvents: "none",
            transform: ` rotate(${()=>{if (rotation>180){
                return rotation - 180;
            }}}deg)`, // Apply rotation here
        }}
        >
            <h1>{title}</h1>
        </div>
    </>
  );
};

export default TextBox;
