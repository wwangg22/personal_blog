'use client'
import React, { useEffect, useState} from 'react';

interface Props {
    coords: [{x:number, y:number, name:string}];
}

const Test: React.FC<Props> = ({coords}) => {
    const angle = 80; // Example angle in degrees, adjust as needed
    const [aspectRatio, setAspectRatio] = useState(1);

    useEffect(() => {
        setAspectRatio(window.innerWidth / window.innerHeight);
    }, []);

    console.log(coords);
    return (
        <>
            {coords.map((coord, index) => {
                const arrowLength = (11 - Math.abs(((coord.x - 50)/6))) + 15 + coord.y - 50;

                return (
                    <>
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: `${coord.y}%`,
                            left: `${coord.x}%`,
                            width: `${arrowLength}vh`, // Length of the arrow
                            height: '5px', // Thickness of the arrow
                            backgroundColor: 'white', // Arrow color
                            transformOrigin: '0% 50%',
                            transform: `rotate(${-90 + ((coord.x - 50)/30) * angle}deg)` //translateX(-100%) translateY(${index % 2 == 0 ? 100 : -100}px)`,
                        }}
                    >
                    </div>
                    {
                        coord.x > 50 ?
                    <div
                        className="text-black p-1"
                        style = {{
                            position: 'absolute',
                            bottom: `${coord.y - Math.sin((-90 + ((coord.x - 50)/30) * angle) / 180 * Math.PI) * (arrowLength + 100 - 2*coord.y)}%`,
                            left: `${(coord.x + Math.cos((-90 + ((coord.x - 50)/30) * angle) / 180 * Math.PI) * (arrowLength / aspectRatio))}%`,
                            backgroundColor: 'white',
                            transform: `translateX(-10px) translateY(10px)`,
                            borderRadius: '5px',
                        }}
                    >
                        {coord.name}
                    </div> :
                    <div
                        className="text-black p-1"
                        style = {{
                            position: 'absolute',
                            bottom: `${coord.y - Math.sin((-90 + ((coord.x - 50)/30) * angle) / 180 * Math.PI) * (arrowLength + 100 - 2*coord.y)}%`,
                            right: `${100 - (coord.x + Math.cos((-90 + ((coord.x - 50)/30) * angle) / 180 * Math.PI) * (arrowLength / aspectRatio))}%`,
                            backgroundColor: 'white',
                            transform: `translateX(10px) translateY(10px)`,
                            borderRadius: '5px',
                        }}
                    >
                        {coord.name}
                    </div>
                    }
                    </>
                );
            })}
        </>
    );
};

export default Test;