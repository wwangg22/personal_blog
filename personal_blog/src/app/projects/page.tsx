'use client';
import React from "react";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProjectBody from "@/components/projects/ProjectBody";

/**
 * ProjectPage – combines header + body into one page.
 * Super‑light wrapper that keeps global styling in one place.
 */
const ProjectPage: React.FC = () => (
  <div className="font-[ClashDisplay-Regular] bg-gray-50 min-h-screen text-gray-800 dark:bg-black dark:text-white">
    <ProjectHeader />
    <ProjectBody />
  </div>
);

export default ProjectPage;
