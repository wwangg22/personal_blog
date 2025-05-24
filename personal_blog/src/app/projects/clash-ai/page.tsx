/* ------------------------------------------------------------------------
   app/projects/clash-royale-ai/page.tsx
   ------------------------------------------------------------------------
   Landing page for the Clash Royale AI project.

   ‣ Uses the same ClashDisplay font & dark-mode support as the rest of the site.
   ‣ Hero banner  → project overview
   ‣ Two-column “How it works” section   (object detection ✦ PPO pipeline)
   ‣ Embedded YouTube demo
   ‣ Call-to-action button linking back to the full blog post
   ‣ (Optional) GitHub repo link – swap in your real URL if public
   --------------------------------------------------------------------- */

   import Image from "next/image";
   import Link from "next/link";
   
   export default function ClashRoyaleAIPage() {
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
             Clash Royale AI
           </h1>
           <p className="text-lg sm:text-xl max-w-2xl mx-auto">
             A computer-vision-driven, PPO-powered agent that learns to battle in
             <em> Supercell’s</em> real-time strategy arena — no game API required.
           </p>
         </section>
   
         {/* ------------ Header Image ---------------------------------------- */}
         <section className="mx-auto max-w-4xl px-6">
           <Image
             src="https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/fce8cff9-de76-44a2-8856-ba7b34c620bc"      /* copy your header to /public/data */
             alt="Sample detection overlay"
             width={1200}
             height={675}
             className="rounded-xl shadow-lg w-full object-cover"
             priority
           />
         </section>
   
         {/* ------------ How it works --------------------------------------- */}
         <section className="mx-auto max-w-5xl px-6 py-20 grid gap-12 md:grid-cols-2">
           {/* Object-detection column */}
           <div>
             <h2 className="text-2xl font-bold mb-4">Vision first</h2>
             <p className="text-lg leading-relaxed">
               A custom-trained <strong>YOLOv5</strong> model spots troops, towers,
               elixir and current deck cards directly from raw screenshots. To keep
               labelling sane, I bootstrap with{" "}
               <span className="whitespace-nowrap">sprite-based</span> synthetic
               images, then fine-tune on ~1.1 k hand-corrected real frames.
             </p>
             <ul className="list-disc list-inside space-y-2 mt-4 text-lg">
               <li>2 000 synthetic images for rapid bootstrapping</li>
               <li>Domain-randomised colours &amp; noise to fight over-fitting</li>
               <li>Separate tiny detector for deck-slot recognition</li>
             </ul>
           </div>
   
           {/* PPO column */}
           <div>
             <h2 className="text-2xl font-bold mb-4">Reinforcement learning core</h2>
             <p className="text-lg leading-relaxed">
               State vectors (ResNet-18 features ✚ detections ✚ elixir/deck stats)
               feed a <strong>PPO</strong> policy that chooses{" "}
               <em>what</em>&nbsp;to play and <em>where</em>&nbsp;to drop it.
               Illegal actions are masked out in the softmax so training isn’t
               wasted on impossible moves.
             </p>
             <ul className="list-disc list-inside space-y-2 mt-4 text-lg">
               <li>Discrete action space with dynamic masking</li>
               <li>Online self-play on a private CR server</li>
               <li>Pluggable reward shaping for aggressive or defensive styles</li>
             </ul>
           </div>
         </section>
   
         {/* ------------ Demo video ----------------------------------------- */}
         <section className="mx-auto max-w-4xl px-6 pb-24">
           <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
             <iframe
               src="https://www.youtube.com/embed/v4Sv72j4RCk"
               title="Clash Royale AI demo"
               className="absolute inset-0 w-full h-full"
               allowFullScreen
             />
           </div>
         </section>
   
         {/* ------------ Call to Action ------------------------------------- */}
         <section className="mx-auto max-w-3xl px-6 pb-32 text-center space-y-8">
           <Link
             href="/blog/000010"
             className="inline-block px-8 py-4 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-black shadow-lg hover:scale-[1.03] transition-transform"
           >
             Read the full development blog&nbsp;→
           </Link>
   
           {/* (Optional) GitHub button — uncomment if / when you open-source */}
           {/* <a
             href="https://github.com/yourname/clash-royale-ai"
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
   