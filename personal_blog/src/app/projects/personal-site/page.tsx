
  'use client';
  import Image from 'next/image';
  import Link from 'next/link';
  
  export default function PersonalWebsitePage() {
    return (
      <main className="font-[ClashDisplay-Regular] min-h-screen bg-white text-black dark:bg-black dark:text-white">
        {/* ------------ Hero ------------------------------------------------- */}
        <section className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
          <Link href="/projects" className="text-blue-600 hover:underline">
            ← Back to projects
          </Link>
        </section>
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Personal&nbsp;Website
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            A full‑stack <strong>Next.js</strong> site deployed on <strong>AWS</strong>, featuring an
            interactive <em>3D&nbsp;Garage</em> built with <strong>Three.js</strong>, a custom blog CMS
            and secure JWT‑powered admin auth.
          </p>
        </section>
  
        {/* ------------ Header Image ---------------------------------------- */}
        {/* TODO: replace src with a real screenshot of your homepage */}
        <section className="mx-auto max-w-4xl px-6">
          <Image
            src="/data/personal/landing_page.jpg"
            alt="Personal website homepage screenshot"
            width={1200}
            height={675}
            className="rounded-xl shadow-lg w-full object-cover"
            priority
          />
        </section>
  
        {/* ------------ Highlights ------------------------------------------ */}
        <section className="mx-auto max-w-6xl px-6 py-20 grid gap-12 md:grid-cols-3">
          {/* 3D Garage */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Immersive 3D&nbsp;Garage</h2>
            <p className="text-lg leading-relaxed">
              Explore <strong>SolidWorks</strong> models of past projectws in an interactive
              Three.js scene. Users can orbit, zoom and toggle exploded views for
              a deep dive into the mechanics.
            </p>
          </div>
  
          {/* Next.js & AWS */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Serverless&nbsp;Stack</h2>
            <p className="text-lg leading-relaxed">
              Built with <strong>Next.js</strong>, deployed via <strong>SST</strong> to AWS CloudFront
              + Lambda@Edge. Assets live in S3 while using <strong>DynamoDB</strong> for super‑low latency worldwide.
            </p>
          </div>
  
          {/* Blog CMS */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Custom&nbsp;Blog CMS</h2>
            <p className="text-lg leading-relaxed">
              A Markdown‑friendly WYSIWYG editor (admin‑only) lets me publish new
              posts on the fly. Auth is secured with <strong>JWT</strong> tokens stored in
              cookies.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-32 text-center space-y-8">
          <h2 className="text-2xl font-bold mb-4">
            Below are some video demos!

          </h2>
        </section>
  
        {/* ------------ Demo / 3D Embed ------------------------------------- */}
        {/* Optional – swap in a model‑viewer iframe or demo video here */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
            {/* Example YouTube placeholder */}
            <iframe
              src="https://www.youtube.com/embed/bXy2Gf0HGqI"
              title="3D Garage demo"
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
            {/* Example YouTube placeholder */}
            <iframe
              src="https://www.youtube.com/embed/cWZLOO-3l6M"
              title="3D Garage demo"
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
        </section>
  
        {/* ------------ Call to Action ------------------------------------- */}
        <section className="mx-auto max-w-3xl px-6 pb-32 text-center space-y-8">
  
          <Link
            href="/blog/000011" /* TODO: link to your full blog post */
            className="inline-block px-8 py-4 rounded-full border border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 shadow-md hover:bg-gray-100 dark:hover:bg-gray-900/10 transition-colors"
          >
            Read the dev story&nbsp;→
          </Link>
  
          {/* (Optional) GitHub button — uncomment if / when you open‑source */}
          {/* <a
            href="https://github.com/yourname/personal-website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg font-semibold text-blue-500 hover:underline"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-5 h-5 fill-current"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 
                11.385.6.112.82-.26.82-.577 0-.285-.01-1.04-.015-2.04
                -3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757
                -1.333-1.757-1.09-.744.083-.729.083-.729 1.205.085 1.84
                1.238 1.84 1.238 1.07 1.834 2.807 1.304 3.492.997.108-.776
                .418-1.305.762-1.605-2.665-.3-5.467-1.332-5.467-5.93
                0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.524.117-3.176
                0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3-.404c1.02.005
                2.045.138 3 .404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652
                .242 2.873.12 3.176.77.84 1.233 1.91 1.233 3.22
                0 4.61-2.807 5.628-5.48 5.92.43.37.814 1.103.814 2.222
                0 1.604-.015 2.896-.015 3.286 0 .32.216.694.825.576
                C20.565 21.796 24 17.298 24 12 24 5.37 18.627 0 12 0z" />
            </svg>
            Star on GitHub
          </a> */}
        </section>
      </main>
    );
  }
  