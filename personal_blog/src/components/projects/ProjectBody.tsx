'use client';
import React from "react";
import Link from "next/link";
import Image from 'next/image';


// compact project data (title, placeholder image, one‑liner)
const projects = [
  {
    id: "ihm-tactile",
    title: "in-hand manipulation w/ raw tactile signals",
    img: "/data/thumbnails/ihm_thumbnail.gif",
    desc: "Training a diffusion‑based controller for a tactile robotic hand.",
  },
  {
    id: "snap-3dar",
    title: "SNAP‑AR3D",
    img: "/data/thumbnails/snap.png",
    desc: "Pipeline that turns phone videos into textured 3D meshes in minutes.",
  },
  {
    id: "ooo-processor",
    title: "Out-of-Order P6 Style Processor",
    img: "/data/thumbnails/ooo_thumbnail.jpg",
    desc: "SystemVerilog implementation of a P6 Style out-of-order processor with a unified LSQ",
  },
  {
    id: "mobile-nerf",
    title: "Mobile NeRF",
    img: "/data/thumbnails/mobilenerf_thumbnail.jpg",
    desc: "Mobile NeRF is a fast, high-quality neural radiance field implementation able to render at high fps on end devices.",
  },
  {
    id: "clash-ai",
    title: "Clash Royale AI",
    img: "/data/thumbnails/clashroyale_thumbnail.png",
    desc: "Vision‑based PPO agent that beats the in‑game AI.",
  },
  {
    id: "garry-rl",
    title: "SAC & TD3 on “Garry”",
    img: "/data/thumbnails/garry_thumbnail.gif",
    desc: "Deep‑RL locomotion for a custom 8‑DOF biped robot.",
  },
  {
    id: "personal-site",
    title: "Personal Website",
    img: "/data/thumbnails/garage_thumbnail.jpg",
    desc: "Next.js blog and 3D garage hosted serverlessly on AWS.",
  },
  {
    id: "diffraction-analysis",
    title: "Diffraction Grating Analysis",
    img: "/data/thumbnails/diff_thumbnail.jpg",
    desc: "Python scripts that quantify grating images for optical research.",
  },
] as const;

/**
 * ProjectBody – grid of clickable project blocks that route to /projects/[id].
 */
const ProjectBody: React.FC = () => (
    <main className="container mx-auto px-4 py-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <Link
          key={p.id}
          href={`/projects/${p.id}`}
          className="
            group rounded-2xl overflow-hidden transition-shadow
            shadow-md shadow-gray-300/60 hover:shadow-lg hover:shadow-gray-400/80
            dark:shadow-white/10 dark:hover:shadow-white/20
            bg-white dark:bg-black
          "
        >
          {/* wrapper gives <Image> a fixed height + relative positioning for `fill` */}
          <div className="relative w-full h-40">
            <Image
              src={p.img}
              alt={p.title}
              fill                          // makes it act like object-fit: cover;
              sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              priority={i === 0}           // eager-load the first thumbnail
              unoptimized                  // remove if you configure the remote domain (see below)
            />
          </div>
  
          <div className="p-4 space-y-2">
            <h2 className="text-lg font-semibold group-hover:underline">{p.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-200">{p.desc}</p>
          </div>
        </Link>
      ))}
    </main>
  );
  
  export default ProjectBody;