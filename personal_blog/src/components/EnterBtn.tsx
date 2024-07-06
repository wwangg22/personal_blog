import React from 'react';
import { useRouter } from 'next/navigation';

interface EnterButtonProps {
  x: number;
  y: number;
  offset:number;
}

const EnterButton: React.FC<EnterButtonProps> = ({ x, y, offset}) => {
    const router = useRouter();

    const handleRedirect = () => {
        console.log('hey')
      router.push('/garage'); // Change '/target-page' to the desired route
    };
    console.log("EnterButton", x, y,offset)
  return (
    <button
      className="absolute transform -translate-x-1/2 -translate-y-1/2 py-2 w-[100px] h-[100px] bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 focus:outline-none text-2xl focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-transform duration-300 z-30 text-center"
      style={{ left: `${x*100}%`, top: `calc(${y*100}% + ${offset}px)` }}
      onClick={handleRedirect}
    >
      Enter
    </button>
  );
};

export default EnterButton;
