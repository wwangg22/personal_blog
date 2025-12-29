// app/projects/gaussians/page.tsx
import Link from "next/link";

interface StaticSceneMeta {
  slug: "old_wc" | "modern_wc" | "dark_wc";
  title: string;
  thumb: string;
}

interface PathSceneMeta {
  slug: "tree" | "sand" | "ruins" | "crystal" | "alleyway";
  title: string;
  thumb: string; // same convention: /data/gaussians/[slug].png
}

const staticScenes: StaticSceneMeta[] = [
  { slug: "old_wc", title: "Old Room", thumb: "/data/gaussians/old_wc.png" },
  { slug: "modern_wc", title: "Modern Room", thumb: "/data/gaussians/modern_wc.png" },
  { slug: "dark_wc", title: "Dark Room", thumb: "/data/gaussians/dark_wc.png" },
];

const guidedFlythroughs: PathSceneMeta[] = [
  { slug: "tree", title: "Tree", thumb: "/data/gaussians/tree.png" },
  { slug: "sand", title: "Sand", thumb: "/data/gaussians/sand.png" },
  { slug: "ruins", title: "Ruins", thumb: "/data/gaussians/ruins.png" },
  { slug: "crystal", title: "Crystal", thumb: "/data/gaussians/crystal.png" },
  { slug: "alleyway", title: "Alleyway", thumb: "/data/gaussians/alleyway.png" },
];

function GalleryGrid({
  items,
  hrefForSlug,
}: {
  items: { slug: string; title: string; thumb: string }[];
  hrefForSlug: (slug: string) => string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ slug, title, thumb }) => (
        <Link
          key={slug}
          href={hrefForSlug(slug)}
          className="group relative block rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
        >
          <img
            src={thumb}
            alt={title}
            width={640}
            height={480}
            className="w-full h-48 object-cover group-hover:brightness-110 group-hover:contrast-110 transition-colors"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute bottom-2 left-3 text-lg font-semibold tracking-wide">
            {title}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function GaussiansGalleryPage() {
  return (
    <main className="font-[ClashDisplay-Regular] min-h-screen bg-gray-950 text-gray-100">
      <section className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
        <Link href="/projects" className="text-blue-600 hover:underline">
          ← Back to projects
        </Link>

        <header className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold">Sora → 3D Gaussian Splats</h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            These scenes start as short <span className="font-semibold">Sora-generated videos</span>.
            I extract frames, estimate camera motion across the clip, then optimize a{" "}
            <span className="font-semibold">3D Gaussian Splat</span> scene so it re-renders those frames.
            The result is a lightweight <code>.splat</code> you can explore interactively in the browser.
          </p>
        </header>

        {/* Section 1: free-look (your existing /projects/gaussians/[slug]) */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Free-Look Scenes</h2>
          </div>

          <GalleryGrid
            items={staticScenes}
            hrefForSlug={(slug) => `/projects/gaussians/${slug}`}
          />
        </section>

        {/* Section 2: camera-path viewer (your new /projects/gaussians/path_viewer/[slug]) */}
        <section className="space-y-4 pt-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Guided Flythroughs</h2>
          </div>

          <GalleryGrid
            items={guidedFlythroughs}
            hrefForSlug={(slug) => `/projects/gaussians/path_viewer/${slug}`}
          />
        </section>

      </section>
    </main>
  );
}
