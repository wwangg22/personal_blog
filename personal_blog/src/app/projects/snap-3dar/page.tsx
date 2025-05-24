// app/projects/[id]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

const ProjectPage: React.FC = () => {
  /* ───────────── STATIC / DUMMY DATA  ───────────── */
  const images = [
    "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.amazonaws.com/Frame+4.png",
    "https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/Frame+3.png",
    // "https://your-bucket/third.png",
  ];

  const youtubeId = "9cUk6gcapfg"; // ← replace with your demo video ID
  const devpostUrl = "https://devpost.com/software/snapar3d"; // ← your Devpost link

  /* ──────────────────────────────────────────────── */
  return (
    <main className="font-[ClashDisplay-Regular] container mx-auto px-4 py-10 space-y-12 text-black bg-white dark:bg-black dark:text-white">
      {/* back nav */}
      <Link href="/projects" className="text-blue-600 hover:underline">
        ← Back to projects
      </Link>

      {/* hero */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">SNAP-AR3D</h1>
        <p className="text-lg max-w-3xl">
          SnapAR3D uses AR guidance to help you capture optimal photos of an
          object while recording precise camera poses. Those poses are then
          converted into NeRF-compatible matrices and fed into NVIDIA&nbsp;
          <em>nvdifrec</em> to produce detailed 3D reconstructions.
        </p>

        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={devpostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
          >
            View Devpost submission ↗
          </Link>
        </div>
      </section>

      {/* gallery
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={`SNAP-AR3D screenshot ${i + 1}`}
            width={1200}
            height={800}
            className="w-full h-auto rounded-2xl shadow object-cover"
            priority={i === 0}
          />
        ))}
      </section> */}

      {/* video */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Project Demo</h2>
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="SnapAR3D Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </section>

      {/* ───── detailed story ───── */}
<section className="max-w-3xl text-lg leading-relaxed space-y-6">
  {/* story intro */}
  <h2 className="text-2xl font-semibold">Project Story</h2>
  <p>
    Our goal was a pipeline that turns phone videos into textured 3D meshes
    in minutes. By capturing ARKit poses we bypass COLMAP, halving
    reconstruction time, and feed images + poses to NVIDIA NVDiffRec for
    photorealistic output. The whole flow ships as a one-tap iOS app:
    capture → model → GLTF export.
  </p>

  {/* tech details */}
  <h2 className="text-2xl font-semibold">Technical Details</h2>

  {/* NVDiffRec */}
  <h3 className="text-xl font-semibold">NVDiffRec (img-to-mesh)</h3>
  <p>
    We built on&nbsp;
    <a
      href="https://nvlabs.github.io/nvdiffrec/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:underline"
    >
      Nvidia’s NVDiffRec
    </a>
    &nbsp;paper. The original method trains ~1 hour on a V100; we needed
    ~10 minutes on a laptop 3080 while keeping quality high.
  </p>
  <p>
    Early high-res meshes were spiky, so we increased the Laplace-scale
    regularizer to suppress sharp changes between vertices. Because most
    objects are fairly smooth, a larger value—especially early in training—
    produced visibly better results.
  </p>
  <p>
    Tuning resolution + regularizer let us achieve solid reconstructions in
    10 minutes. The loss curve is shown below.
  </p>

  <figure>
    <Image
      src="https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.amazonaws.com/Frame+3.png"
      alt="Training graph"
      width={1200}
      height={800}
      className="w-full h-auto rounded-2xl shadow object-cover"
    />
    <figcaption className="mt-2 text-sm text-gray-500 dark:text-gray-400">
      Training loss vs. iterations.
    </figcaption>
  </figure>

  <p>
    The HDR map captures scene lighting; <em>Kd</em>, <em>Korm</em>, and the
    normal map are the recovered object textures.
  </p>

  {/* ARKit SLAM */}
  <h3 className="text-xl font-semibold">ARKit Built-in SLAM</h3>
  <p>
    A standard pipeline overview is shown below.
  </p>

  <figure>
    <Image
      src="https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.amazonaws.com/Frame+4.png"
      alt="Standard pipeline"
      width={1200}
      height={800}
      className="w-full h-auto rounded-2xl shadow object-cover"
    />
  </figure>

  {/* COLMAP vs. ARKit narrative */}
  <p>
    Traditionally, users run COLMAP on videos to extract camera poses, but
    it often fails with objects on plain white surfaces because there aren’t
    enough background features to verify transformations.
  </p>
  <p>
    ARKit’s SLAM provides continuous poses, yet its image quality can vary.
    To guarantee crisp frames we built a Swift UI that overlays a tiled
    sphere on the object: users align the camera with each tile until it
    disappears, ensuring uniform, high-quality coverage.
  </p>
  <p>
    Repeating this interaction yields a robust photo set and poses for
    reconstruction. A full demo appears in the video above.
  </p>

  {/* attribution */}
  <p>
    This project was developed during the&nbsp;
    <a
      href="https://www.treehacks.com/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:underline"
    >
      TreeHacks
    </a>
    &nbsp;hackathon.
  </p>
</section>

    </main>
  );
};

export default ProjectPage;
