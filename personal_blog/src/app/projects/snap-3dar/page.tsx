// app/projects/[id]/page.tsx
import React from "react";
import Link from "next/link";


const ProjectPage: React.FC<> = () => {


  return (
    <main className="font-[ClashDisplay-Regular] container mx-auto px-4 py-8 space-y-8 text-gray-800">
      <Link href="/projects" className="text-blue-600 hover:underline">
        ← Back to projects
      </Link>

      <div className="space-y-4">
        <h1 className="text-3xl font-bold">SNAP-AR3D</h1>
        <p className="text-lg text-gray-600">SnapAR3D uses AR to guide you in capturing optimal photos of an object, while precisely recording the camera’s positions and orientations relative to that object. This data is transformed into matrices and imported into NVIDIA Diffractive Reconstruction (nvdifrec) to generate high-quality 3D models.</p>
      </div>

      <img
        src={"https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/Frame+4.png"}
        alt={"SNAP-AR3D"}
        className="w-full max-h-[60vh] object-cover rounded-2xl shadow"
      />

      <ul className="list-disc pl-6 space-y-2">
        {/* {project.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))} */}
      </ul>
    </main>
  );
};

export default ProjectPage;
