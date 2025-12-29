// app/projects/gaussians/[slug]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GaussianSplatViewerPath from "@/components/GaussianSplatViewerPath";

interface GaussianSceneProps {
  params: { slug: string };
}

type Size = { w: number; h: number };

function computeViewerSize(): Size {
  const H_PADDING = 32;
  const V_PADDING = 160;
  const maxW = window.innerWidth - H_PADDING;
  const maxH = window.innerHeight - V_PADDING;

  const aspect = 16 / 9;

  let w = Math.floor(maxW);
  let h = Math.floor(w / aspect);

  if (h > maxH) {
    h = Math.floor(maxH);
    w = Math.floor(h * aspect);
  }

  w = Math.min(w, 1400);
  h = Math.floor(w / aspect);

  w = Math.max(w, 320);
  h = Math.max(h, 240);

  return { w, h };
}

const TITLES: Record<string, string> = {
  old_wc: "Old Room",
  modern_wc: "Modern Room",
  dark_wc: "Dark Room",
};

const GaussianScene: React.FC<GaussianSceneProps> = ({ params }) => {
  const slug = params.slug;
  const title = TITLES[slug] ?? slug;

  const [size, setSize] = useState<Size>({ w: 960, h: 540 });

  useEffect(() => {
    const update = () => setSize(computeViewerSize());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const linkStyle = useMemo(() => ({ width: size.w }), [size.w]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gray-900">
      <Link
        href="/projects/gaussians"
        className="text-blue-400 hover:underline text-left"
        style={linkStyle}
      >
        ← Back
      </Link>

      <div className="text-gray-100 font-semibold text-left" style={linkStyle}>
        {title}
      </div>

      <GaussianSplatViewerPath
        splatUrl={`/data/gaussians/${slug}.splat`}
        camerasUrl={`/data/gaussians/${slug}_cameras.json`}
        width={size.w}
        height={size.h}
      />
    </div>
  );
};

export default GaussianScene;
