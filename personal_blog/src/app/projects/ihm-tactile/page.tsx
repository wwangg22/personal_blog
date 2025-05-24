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
