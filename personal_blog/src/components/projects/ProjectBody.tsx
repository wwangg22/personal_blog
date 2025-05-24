'use client';
import React from "react";
import Link from "next/link";

// compact project data (title, placeholder image, one‑liner)
const projects = [
  {
    id: "ihm-tactile",
    title: "in-hand manipulation w/ raw tactile signals",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/a67e80b2-8a87-4b21-a2f2-57cb8fa86e85.gif",
    desc: "Training a diffusion‑based controller for a tactile robotic hand.",
  },
  {
    id: "snap-3dar",
    title: "SNAP‑AR3D",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/Frame+4.png",
    desc: "Pipeline that turns phone videos into textured 3D meshes in minutes.",
  },
  {
    id: "ooo-processor",
    title: "Out-of-Order P6 Style Processor",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/Screenshot+2025-05-23+170223.jpg",
    desc: "SystemVerilog implementation of a P6 Style out-of-order processor with a unified LSQ",
  },
  {
    id: "mobile-nerf",
    title: "Mobile NeRF",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/Screenshot+2025-05-23+165453.jpg",
    desc: "Mobile NeRF is a fast, high-quality neural radiance field implementation able to render at high fps on end devices.",
  },
  {
    id: "clash-ai",
    title: "Clash Royale AI",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/fce8cff9-de76-44a2-8856-ba7b34c620bc.png",
    desc: "Vision‑based PPO agent that beats the in‑game AI.",
  },
  {
    id: "garry-rl",
    title: "SAC & TD3 on “Garry”",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/d86c93bf-9dd5-42dc-9e32-3b0369690b5e.gif",
    desc: "Deep‑RL locomotion for a custom 8‑DOF biped robot.",
  },
  {
    id: "personal-site",
    title: "Personal Website",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/Screenshot+2025-05-23+130951.jpg",
    desc: "Next.js blog and 3D garage hosted serverlessly on AWS.",
  },
  {
    id: "diffraction-analysis",
    title: "Diffraction Grating Analysis",
    img: "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/1-20_R-2.jpg",
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
        className="
        group rounded-2xl overflow-hidden transition-shadow
        shadow-md shadow-gray-300/60 hover:shadow-lg hover:shadow-gray-400/80
        dark:shadow-white/10 dark:hover:shadow-white/20
        bg-white dark:bg-black
      "
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
          <p className="text-sm text-gray-600 dark:text-gray-200">{p.desc}</p>
        </div>
      </Link>
    ))}
  </main>
);

export default ProjectBody;
