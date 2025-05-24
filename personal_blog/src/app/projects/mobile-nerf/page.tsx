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
     
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Mobile‑Friendly NeRF Demos</h1>
        <p className="text-gray-400 leading-relaxed text-lg">
          Explore a collection of compact Neural Radiance Field scenes that run
          directly in the browser—no plugins, no heavy downloads. Click any
          thumbnail to open an interactive viewer powered by our lightweight
          <span className="text-white font-medium"> MobileNeRF </span>
          pipeline.
        </p>
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
