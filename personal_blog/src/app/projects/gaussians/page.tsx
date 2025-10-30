// DrumScene.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import GaussianSplatViewer from '@/components/3DGaussianRenderer'; // adjust path if needed

const GaussianScene: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-900">
    {/* Back button on its own row */}
    <Link href="/projects/mobile-nerf" className="text-blue-400 hover:underline w-[800px] text-left">
      ← Back
    </Link>

    {/* NeRF viewer */}
   <GaussianSplatViewer
    splatUrl="/data/gaussians/tree.splat"
    camerasUrl="/data/gaussians/tree_cameras.json"
    width={960}
    height={540}
    />
  </div>
);

export default GaussianScene;
