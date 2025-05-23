// app/projects/[id]/page.tsx
import React from "react";
import Link from "next/link";

// ---- same lightweight data source ------------------------------
const projects = [
  {
    id: "diffusion-policy",
    title: "Diffusion Policy on Tactile Hand",
    img: "https://placehold.co/1200x600?text=Diffusion+Policy",
    desc: "Training a diffusion‑based controller for a tactile robotic hand.",
    bullets: [
      "Collected expert demonstrations on a Shadow Dexterous Hand outfitted with BioTac sensors.",
      "Adapted the Diffusion Policy architecture for high‑dimensional tactile inputs.",
      "Achieved successful grasp‑and‑rotate on unseen objects with <3 mm positional error.",
    ],
  },
  {
    id: "snap-3dar",
    title: "SNAP‑3DAR Video → 3D Model",
    img: "https://placehold.co/1200x600?text=SNAP-3DAR",
    desc: "Pipeline that turns phone videos into textured 3D meshes in minutes.",
    bullets: [
      "Captured ARKit camera poses to bypass COLMAP and halve reconstruction time.",
      "Fed images + poses into NVidia NVDiffRec for photorealistic meshes.",
      "Packaged into a one‑tap iOS app for end‑to‑end capture → model → GLTF export.",
    ],
  },
  // ... (other projects truncated for brevity) ...
] as const;

//--------------------------------------------------------------
interface PageProps {
  params: {
    id: string;
  };
}

const ProjectPage: React.FC<PageProps> = ({ params }) => {
  const project = projects.find((p) => p.id === params.id);

  if (!project) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-4">Project not found</h1>
        <Link href="/projects" className="text-blue-600 hover:underline">
          ← Back to projects
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-8 text-gray-800">
      <Link href="/projects" className="text-blue-600 hover:underline">
        ← Back to projects
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-lg text-gray-600">{project.desc}</p>
      </div>

      <img
        src={project.img}
        alt={project.title}
        className="w-full max-h-[60vh] object-cover rounded-2xl shadow"
      />

      <ul className="list-disc pl-6 space-y-2">
        {project.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </main>
  );
};

export default ProjectPage;
