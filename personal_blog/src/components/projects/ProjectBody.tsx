'use client';
import React from "react";
import Link from "next/link";

// compact project data (title, placeholder image, one‑liner)
const projects = [
  {
    id: "diffusion-policy",
    title: "Diffusion Policy on Tactile Hand",
    img: "https://placehold.co/600x400?text=Diffusion+Policy",
    desc: "Training a diffusion‑based controller for a tactile robotic hand.",
  },
  {
    id: "snap-3dar",
    title: "SNAP‑3DAR Video → 3D Model",
    img: "https://placehold.co/600x400?text=SNAP‑3DAR",
    desc: "Pipeline that turns phone videos into textured 3D meshes in minutes.",
  },
  {
    id: "clash-ai",
    title: "Clash Royale AI",
    img: "https://placehold.co/600x400?text=Clash+AI",
    desc: "Vision‑based PPO agent that beats the in‑game AI.",
  },
  {
    id: "garry-rl",
    title: "SAC & TD3 on “Garry”",
    img: "https://placehold.co/600x400?text=Garry+RL",
    desc: "Deep‑RL locomotion for a custom 8‑DOF biped robot.",
  },
  {
    id: "personal-site",
    title: "Personal Website",
    img: "https://placehold.co/600x400?text=Website",
    desc: "Next.js blog and 3D garage hosted serverlessly on AWS.",
  },
  {
    id: "driving-sim",
    title: "Mobile Driving Simulator",
    img: "https://placehold.co/600x400?text=Driving+Sim",
    desc: "Rust+WebAssembly physics for a playable browser racing game.",
  },
  {
    id: "diffraction-analysis",
    title: "Diffraction Grating Analysis",
    img: "https://placehold.co/600x400?text=Optics",
    desc: "Python scripts that quantify grating images for optical research.",
  },
] as const;

/**
 * ProjectBody – grid of clickable project blocks that route to /projects/[id].
 */
const ProjectBody: React.FC = () => (
  <main className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
    {projects.map((p) => (
      <Link
        key={p.id}
        href={`/projects/${p.id}`}
        className="group bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition-shadow"
      >
        <img
          src={p.img}
          alt={p.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-semibold group-hover:underline">
            {p.title}
          </h2>
          <p className="text-sm text-gray-600">{p.desc}</p>
        </div>
      </Link>
    ))}
  </main>
);

export default ProjectBody;
