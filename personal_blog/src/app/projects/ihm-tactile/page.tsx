// app/demo/page.tsx
import React from "react";
import Link from "next/link";

const YOUTUBE_ID = "ldG13yCEtFQ"; // demo video from the paper
const PDF_PATH   = "/data/COMS6698_Final_Report.pdf"; // put the PDF in /public

export default function PaperDemoPage() {
  return (
    <main className="font-[ClashDisplay-Regular] container mx-auto max-w-5xl px-4 py-12 space-y-12 text-black bg-white dark:bg-black dark:text-white">
      {/* ───── hero ───── */}
      <Link href="/projects" className="text-blue-600 hover:underline">
        ← Back to projects
      </Link>

      <section className="space-y-3">
        <h1 className="text-4xl font-bold leading-tight">
          in-hand manipulation w/ raw tactile signals
        </h1>
      </section>

      <section className="space-y-4">
  <h2 className="text-2xl font-semibold">Quick&nbsp;Project&nbsp;Overview</h2>

  {/* three-column row */}
  <div className="flex flex-col gap-6 md:flex-row md:gap-8">
    {/* Goal */}
    <div className="flex-1 p-6 rounded-2xl shadow bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-2">Goal</h3>
      <p>
        Enable a 12-DOF robotic hand to <em>continuously rotate a 40 mm lug-nut</em> in the real world—
        surviving slips and unexpected pushes—by harnessing its built-in raw tactile sensors.
      </p>
    </div>

    {/* Approach */}
    <div className="flex-1 p-6 rounded-2xl shadow bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-2">Approach</h3>
      <p>
        1) Train a PPO “expert” in Isaac Gym.<br/>
        2) Collect ≈45 k real trajectories with RGB-D and 28-channel touch.<br/>
        3) Distill that data into a Transformer (BAKU) policy that ingests raw tactile + vision—no tactile
        simulation required.
      </p>
    </div>

    {/* Result */}
    <div className="flex-1 p-6 rounded-2xl shadow bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-2">Result</h3>
      <p>
        The multimodal policy lasts <strong>≈ 180 s vs 13 s</strong> for the RL expert on the hardest test,
        a ~14× gain—demonstrating that raw tactile feedback dramatically improves robustness and self-recovery.
      </p>
    </div>
  </div>
</section>

      {/* ───── video ───── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Project&nbsp;Demo&nbsp;Video</h2>
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}`}
            title="Project demo video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* ───── paper reader ───── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Read the Paper</h2>

        {/* In-page PDF viewer (falls back to download on browsers that block inline PDFs) */}
        <div className="w-full h-[80vh] rounded-2xl overflow-hidden border shadow">
          <iframe
            className="w-full h-full"
            src={`${PDF_PATH}#toolbar=0&navpanes=0&scrollbar=0`}
            title="COMS 6698 final report PDF"
          />
        </div>

        {/* download / open-in-new-tab link */}
        <p className="text-sm">
          Trouble viewing?{" "}
          <Link
            href={PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download the PDF ↗
          </Link>
        </p>
      </section>
    </main>
  );
}
