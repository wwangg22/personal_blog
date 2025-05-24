import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Particles = dynamic(() => import('@/components/Particles'), {
  ssr: false, // This ensures that the Particles component is only loaded on the client side
});

export default async function Home() {
  

  return (
    <>
    <main className = "bg w-screen h-screen text-white">
      <div className="z-10 relative flex flex-col items-center justify-center h-screen">
          <div className="text-[5rem] lg:text-[9rem] mb-8 pointer-events-none">William</div>
          <div className="lg:flex justify-between gap-10 text-[3rem] element">
              <div className="hover:scale-110 transform transition-transform duration-1000 cursor-pointer"><Link href="/garage">3-D Portfolio</Link></div>
              <div className="hover:scale-110 transform transition-transform duration-1000 cursor-pointer"><Link href="/blog">Blog</Link></div>
              <div className="hover:scale-110 transform transition-transform duration-1000 cursor-pointer"><Link href="/projects">Projects</Link></div>
              <div className="hover:scale-110 transform transition-transform duration-1000 cursor-pointer"><a href="/William_Wang_Resume_2025.pdf" download="William_Wang_Resume_2025.pdf">Resume</a></div>
          </div>
      </div>
      <Particles/>
    </main>
    </>
  );
}
