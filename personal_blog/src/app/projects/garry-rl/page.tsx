/* ------------------------------------------------------------------------
   app/projects/garry-rl/page.tsx
   ------------------------------------------------------------------------
   Landing page for the “RL Adventures with Garry” project.

   ✦ Hero       → high-level pitch
   ✦ Pipeline   → CAD-to-MuJoCo workflow
   ✦ RL section → TD3 + reward-shaping journey
   ✦ Result     → semi-successful walk GIF / image
   ✦ CTA        → full blog + GitHub repo
   --------------------------------------------------------------------- */

   import Image from "next/image";
   import Link from "next/link";
   
   export default function GarryRLPage() {
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
             RL Adventures with Garry
           </h1>
           <p className="text-lg sm:text-xl max-w-2xl mx-auto">
             From SolidWorks CAD&nbsp;➜ MuJoCo simulation&nbsp;➜ TD3 training —
             chasing a stable bipedal gait on a custom-built robot.
           </p>
         </section>
   
         {/* ------------ Header Image ---------------------------------------- */}
         <section className="mx-auto max-w-4xl px-6">
           <Image
             src="https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/Screenshot+2025-05-25+002845.jpg"  /* copy your header into /public/data */
             alt="Garry robot model overlay"
             width={1200}
             height={675}
             className="rounded-xl shadow-lg w-full object-cover"
             priority
           />
         </section>
   
         {/* ------------ CAD → MuJoCo pipeline ------------------------------ */}
         <section className="mx-auto max-w-5xl px-6 py-20 grid gap-12 md:grid-cols-2">
           <div>
             <h2 className="text-2xl font-bold mb-4">Getting Garry into MuJoCo</h2>
             <p className="text-lg leading-relaxed">
               SolidWorks assemblies were converted to <code>.urdf</code> and then
               to MuJoCo XML. Passive joints weren’t preserved, so I exported{" "}
               <em>two&nbsp;variants</em> of the model, measured the offsets, and
               stitched them back together with{" "}
               <strong>&lt;equality&nbsp;joint&nbsp;…/&gt;</strong> tags.
             </p>
             <ul className="list-disc list-inside space-y-2 mt-4 text-lg">
               <li>Dual-export trick for passive joint coordinates</li>
               <li>Custom script to patch equality joints in XML</li>
               <li>One-to-one sensor mapping for MuJoCo logs</li>
             </ul>
           </div>
   
           <div className="flex items-center justify-center">
             <Image
               src="https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/76824921-6e6b-4363-988f-fde8b8e0448e"   /* optional supplementary image */
               alt="CAD to MuJoCo"
               width={600}
               height={450}
               className="rounded-lg shadow-md"
             />
           </div>
         </section>
   
         {/* ------------ RL section ----------------------------------------- */}
         <section className="mx-auto max-w-5xl px-6 py-20 grid gap-12 md:grid-cols-2">
           <div className="order-last md:order-first">
             <Image
               src="https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/5f7320b3-8c6f-4afe-89c5-cac637848b74"   /* e.g. training reward curve */
               alt="TD3 training graph"
               width={600}
               height={450}
               className="rounded-lg shadow-md"
             />
           </div>
   
           <div>
             <h2 className="text-2xl font-bold mb-4">TD3 + Reward Shaping</h2>
             <p className="text-lg leading-relaxed">
               A lightweight MuJoCo wrapper mimics OpenAI&nbsp;Gym’s{" "}
               <code>step()</code> API.  Experience is stored in a replay buffer
               and optimised with <strong>TD3</strong>.  Most of the iteration
               happened in&nbsp;reward design:
             </p>
             <ul className="list-disc list-inside space-y-2 mt-4 text-lg">
               <li>Phase&nbsp;1 — reward <em>Δx</em> only ⇒ learned to jump</li>
               <li>
                 Phase&nbsp;2 — add upright penalty ⇒ cautious one-leg hop
               </li>
               <li>
                 Phase&nbsp;3 — ankle joint&nbsp;→ ball joint hack ⇒ baby-steps
               </li>
             </ul>
             <p className="text-lg mt-4">
               After fine-tuning the weights, Garry produced a{" "}
               <em>semi-successful</em> walk in sim — but the real servos couldn’t
               handle torque control, so deployment awaits a new hardware build.
             </p>
           </div>
         </section>
   
         {/* ------------ Result GIF / image ---------------------------------- */}
         <section className="mx-auto max-w-4xl px-6 pb-24">
           <Image
             src="https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com/d86c93bf-9dd5-42dc-9e32-3b0369690b5e"   /* export your demo as a gif/mp4 poster */
             alt="Semi-successful walk"
             width={800}
             height={450}
             className="rounded-xl shadow-lg w-full object-cover"
           />
         </section>
   
         {/* ------------ Call to Action ------------------------------------- */}
         <section className="mx-auto max-w-3xl px-6 pb-32 text-center space-y-8">
           <Link
             href="/blog/000009"
             className="inline-block px-8 py-4 rounded-full bg-gray-900 text-white dark:bg-gray-100 dark:text-black shadow-lg hover:scale-[1.03] transition-transform"
           >
             Read the full build log&nbsp;→
           </Link>
   
         </section>
       </main>
     );
   }
   