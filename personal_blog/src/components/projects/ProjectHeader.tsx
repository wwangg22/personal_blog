'use client';
import React from "react";

/**
 * ProjectHeader – a standalone header component for a project page.
 * Drop it at the top of your page and pair it with a <main> body below.
 * Tailwind‑only, no extra deps.
 */
const ProjectHeader: React.FC = () => (
  <header className="py-6 bg-white dark:bg-black shadow-md">
    <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* project title */}
      <h1 className="text-3xl font-bold tracking-tight">Projects</h1>

      {/* lightweight nav */}
      <nav className="flex flex-wrap gap-4 text-sm md:text-base">
        <a href="/" className="hover:underline">
          Main Menu
        </a>
        
      </nav>
    </div>
  </header>
);

export default ProjectHeader;
