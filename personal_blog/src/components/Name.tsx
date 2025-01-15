'use client'
import React, {useEffect, useRef} from 'react';


function easeInOutLerp(start: number, end: number, t: number): number {
    t = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    return start + (end - start) * t;
  }

  function momentumLerp(current: number, target: number, momentum: number, t: number): number {
    // Calculate the difference between the target and the current value
    let difference = target - current;

    // Update the current value based on the new velocity
    let newValue = current + difference * t * momentum;

    return newValue;
}

const Name: React.FC = () => {

    const lerpRef = useRef(50);
    const currentRef = useRef(50);
    const progressRef = useRef(0);
    const realCurrentRef = useRef(50);
    const velocityRef = useRef(0);
    const realvelocityRef = useRef(0);
    const duration = 0.5;
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const binoMask = document.querySelector('.mask') as HTMLElement;
            const targetElement = document.querySelector('.element') as HTMLElement;
            if (!binoMask || !targetElement) return;

            const rect = targetElement.getBoundingClientRect();
            console.log(rect);

            const { clientX, clientY } = event;
            let x = ((clientX) / window.innerWidth) * 100;
            let y = ((clientY) / window.innerHeight) * 100;

            const minX = (rect.left / window.innerWidth) * 100;
            const maxX = (rect.right / window.innerWidth) * 100;
            const minY = (rect.top / window.innerHeight) * 100;
            const maxY = (rect.bottom / window.innerHeight) * 100;

            // Clamp the x and y values within the bounds of the target element
            x = Math.max(minX, Math.min(maxX, x));
            y = Math.max(minY, Math.min(maxY, y));

          realCurrentRef.current = currentRef.current;
        //   realvelocityRef.current = velocityRef.current;

          lerpRef.current = x;
          progressRef.current = 0;
        };
    
        document.addEventListener('mousemove', handleMouseMove);
        let prev = 0
        const animate = (time: number) => {
            requestAnimationFrame(animate);
            const current = momentumLerp(currentRef.current, lerpRef.current, 0.5, (time-prev)/1000);
            const binoMask = document.querySelector('.mask') as HTMLElement;
            const maskImageValue = `radial-gradient(ellipse 250px ${500}px at ${current}% ${55}%, transparent 50%, black 60%)`;
            binoMask.style.webkitMaskImage = maskImageValue;
            binoMask.style.maskImage = maskImageValue;
            currentRef.current = current;

 
            // if (progressRef.current != duration){
            //     progressRef.current += (time - prev)/1000;
            //     if (progressRef.current > duration){
            //         progressRef.current = duration;
            //     }
            //     console.log(progressRef.current);
            //     const current = easeInOutLerp(realCurrentRef.current, lerpRef.current,  progressRef.current / duration);
            //     const binoMask = document.querySelector('.mask') as HTMLElement;
            //     const maskImageValue = `radial-gradient(circle 300px at ${current}% ${50}%, transparent 50%, black 60%)`;
            //     binoMask.style.webkitMaskImage = maskImageValue;
            //     binoMask.style.maskImage = maskImageValue;
            //     currentRef.current = current;
            // }

          
            prev = time;
        }
        requestAnimationFrame(animate);
    
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
        };
      }, []);
    return (
        <>

            <div className= "mask"></div>
        </>
    )
}

export default Name;