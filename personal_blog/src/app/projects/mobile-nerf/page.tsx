// app/projects/mobile-nerf/page.tsx (Next.js 13+ App Router)
// ---------------------------------------------------------------------------
// Landing page that introduces MobileNeRF and shows a clickable gallery grid.
// Each thumbnail links to /projects/mobile-nerf/[id]. Replace the `scenes`
// array with your real scene metadata or fetch it from an API/JSON file.

import Image from "next/image";
import Link from "next/link";

interface SceneMeta {
  id: string;
  title: string;
  thumb: string; // URL or path in /public
}

// Static demo data; could also be fetched in a Server Component.
const scenes: SceneMeta[] = [
  {
    id: "car_nobg",
    title: "My Car",
    thumb: "/data/car.jpg",
  },
  {
    id: "william",
    title: "Me",
    thumb: "/data/william.jpg",
  },
  {
    id: "noco9",
    title: "study session",
    thumb: "/data/study_sesh.jpg",
  },
  // ...add more scenes here
];

export default function MobileNerfGalleryPage() {
  return (
    <main className="font-[ClashDisplay-Regular] min-h-screen bg-gray-950 text-gray-100">
        <section className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
    <Link href="/projects" className="text-blue-600 hover:underline">
        ← Back to projects
      </Link>
      </section>
      {/* Hero section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
     
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Instant-NGP Mobile NeRF Demos</h1>
      </section>

      {/* Gallery grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scenes.map(({ id, title, thumb }) => (
            <Link
              key={id}
              href={`/projects/mobile-nerf/${id}`}
              className="group relative block rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
            >
              <Image
                src={thumb}
                alt={title}
                width={640}
                height={480}
                className="w-full h-48 object-cover group-hover:brightness-110 group-hover:contrast-110 transition-colors"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-2 left-3 text-lg font-semibold tracking-wide">
                {title}
              </span>
            </Link>
          ))}
        </div>
      </section>

    <section className="max-w-4xl mx-auto px-4 py-32 text-center">
    <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
        Technical Details
    </h2>

    {/* Original MobileNeRF summary */}
    <p className="text-lg text-left">
        The original&nbsp;
        <a
        href="https://mobile-nerf.github.io/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline"
        >
        MobileNeRF&nbsp;paper
        </a>
        &nbsp;represents a scene as a <em>fixed-topology</em> triangle mesh whose
        per-face textures store an <strong>8-D learned feature vector</strong> plus
        a binary opacity mask. At render time the mesh is rasterised with a
        conventional Z-buffer, and a tiny, view-dependent MLP embedded in the
        fragment shader converts those features into final pixel colours. Training
        happens in three stages: (1)&nbsp;continuous vertex/feature optimisation,
        (2)&nbsp;opacity binarisation with a straight-through estimator, and
        (3)&nbsp;baking everything into an OBJ&nbsp;+ texture atlas so the scene
        ships as <code>OBJ&nbsp;+ PNGs&nbsp;+ 2-layer&nbsp;MLP</code>.
    </p>

    {/* My upgrades */}
    <ul className="mt-8 text-lg text-left list-disc list-inside space-y-3">
        <li>
        <strong>Instant-NGP hash encoding.</strong> Swapped MobileNeRF’s plain
        MLPs for the multiresolution&nbsp;hash grid from&nbsp;
        <a
            href="https://github.com/ashawkey/torch-ngp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
        >
            ash-awkey’s torch-ngp
        </a>
        . The hash encoder delivers high-frequency detail with far fewer
        parameters, and Tiny-CUDA-NN kernels give a <em>6–8 ×</em> speed-up in the
        first optimisation stage.
        </li>
        <li>
        <strong>CUDA / PyTorch rewrite.</strong> The Google prototype is written
        in JAX; I re-implemented every stage with PyTorch&nbsp;+ tiny-cuda-nn so
        it trains on commodity NVIDIA GPUs without TPU/JAX tooling.
        </li>
        <li>
        <strong>Opacity-first ray marcher.</strong> Instant-NGP is density-based
        by default, whereas MobileNeRF expects alpha values. I patched the
        ray-marcher and loss to predict opacity directly, avoiding an extra
        σ→α conversion and keeping baked textures compatible with the WebGL
        viewer.
        </li>
    </ul>

    {/* Result line */}
    <p className="text-lg text-left mt-6">
        <strong>Result&nbsp;→</strong> a full MobileNeRF trains from scratch in
        ≈ 5 h on a single consumer end GPU (≈ 2 h continuous, 2 h binarised, 1 h
        bake).
    </p>

    <p className="text-lg text-left mt-6">
        I have forked the instant-ngp repo, and implemented my training scripts there. Source code is below!
    </p>

    <a
    href="https://github.com/wwangg22/torch-ngp/"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors shadow-lg"
  >
    {/* GitHub logo (inline SVG) */}
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-5 h-5 fill-current text-gray-100"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.112.82-.26.82-.577
        0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.729.083-.729
        1.205.085 1.84 1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93
        0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3-.404c1.02.005
        2.045.138 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.12 3.176.77.84
        1.233 1.91 1.233 3.22 0 4.61-2.807 5.628-5.48 5.92.43.37.814 1.103.814 2.222
        0 1.604-.015 2.896-.015 3.286 0 .32.216.694.825.576C20.565
        21.796 24 17.298 24 12 24 5.37 18.627 0 12 0z" />
    </svg>
    <span className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
    https://github.com/wwangg22/torch-ngp/
    </span>
  </a>


    </section>
   


    </main>
  );
}

/*
Notes:
------
1. **Routing**: Next.js will match `/projects/mobile-nerf/<id>` with a
   corresponding file in `app/projects/mobile-nerf/[id]/page.tsx` (App Router)
   or `pages/projects/mobile-nerf/[id].tsx` (Pages Router).

2. **Images**: Thumbnails are served from `/public/images/mobile-nerf/*`. If you
   use an external host, remember to whitelist it in `next.config.js` via
   `images.remotePatterns`.

3. **Styling**: Uses Tailwind utility classes; adjust to match your design
   system.

4. **Data Source**: Replace the hard‑coded `scenes` array with a JSON fetch or a
   CMS query (e.g. `GET /data/mobile_nerf_gallery.json`) if you need runtime
   data.
*/
