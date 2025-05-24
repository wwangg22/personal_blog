// DrumScene.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import NerfViewer from '@/components/NerfRenderer'; // adjust path if needed

interface DrumSceneProps {
  params: { slug: string };
}

const DrumScene: React.FC<DrumSceneProps> = ({ params }) => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-900">
    {/* Back button on its own row */}
    <Link href="/projects/mobile-nerf" className="text-blue-400 hover:underline w-[800px] text-left">
      ← Back
    </Link>

    {/* NeRF viewer */}
    <NerfViewer
      objName={params.slug}
      width={800}
      height={800}
      objectScale={0.1}
      className="rounded-2xl shadow-xl"
    />
  </div>
);

export default DrumScene;
