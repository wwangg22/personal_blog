'use client';
import React from 'react';
import Link from 'next/link';
import ChartImage from '@/components/ChartImage';   // path may vary

// If you have a demo video, uncomment the line below and the section later.
// const YOUTUBE_ID = 'your-video-id';


// PDF in /public/data
const PDF_PATH = '/data/CSEE_4824_Final_Report.pdf';

// S3 bucket root
const BUCKET = 'https://niudbb12-personal-blog-site-publixbucketf7b62b51-t62xl2tsxvkk.s3.us-east-1.amazonaws.com';

// —— baseline-only charts —————————————————————————
const baselineCharts = [
  { src: `${BUCKET}/cpi.png`,        alt: 'CPI per program (baseline)' },
  { src: `${BUCKET}/rob_util.png`,   alt: 'ROB utilisation (baseline)' },
  { src: `${BUCKET}/lsq_util.png`,   alt: 'LSQ utilisation (baseline)' },
  { src: `${BUCKET}/dc_util.png`,    alt: 'D-Cache utilisation (baseline)' },
  { src: `${BUCKET}/hit_rate.png`,   alt: 'Cache hit-rate (baseline)' },
  { src: `${BUCKET}/miss_rate.png`,  alt: 'Cache miss-rate (baseline)' },
];

// —— baseline vs mult-pipelined comparison charts ——
const compareCharts = [
  { src: `${BUCKET}/compare_baseline_vs_mult_pipelined_cpi.png`,        alt: 'Baseline vs. pipelined: CPI' },
  // “d$_util” needs %24 for the dollar sign
  { src: `${BUCKET}/compare_baseline_vs_mult_pipelined_d%24_util.png`,  alt: 'Baseline vs. pipelined: D$ utilisation' },
  { src: `${BUCKET}/compare_baseline_vs_mult_pipelined_dc_util.png`,    alt: 'Baseline vs. pipelined: D-Cache utilisation' },
  { src: `${BUCKET}/compare_baseline_vs_mult_pipelined_lsq_util.png`,   alt: 'Baseline vs. pipelined: LSQ utilisation' },
  { src: `${BUCKET}/compare_baseline_vs_mult_pipelined_rob_util.png`,   alt: 'Baseline vs. pipelined: ROB utilisation' },
  { src: `${BUCKET}/compare_baseline_vs_mult_pipelined_hit_rate.png`,   alt: 'Baseline vs. pipelined: cache hit-rate' },
  { src: `${BUCKET}/compare_baseline_vs_mult_pipelined_miss_rate.png`,  alt: 'Baseline vs. pipelined: cache miss-rate' },
];
export default function OOOProcessorDemo() {
  return (
    <main className="font-[ClashDisplay-Regular] container mx-auto max-w-5xl px-4 py-12 space-y-12 text-black bg-white dark:bg-black dark:text-white">

      {/* ───── heading ───── */}
      <Link href="/projects" className="text-blue-600 hover:underline">
        ← Back to projects
      </Link>

      <section className="space-y-2">
        <h1 className="text-4xl font-bold leading-tight">
          P6-Style Out-of-Order RISC-V Processor
        </h1>
      </section>

      {/* ───── technical overview ───── */}
      <section className="space-y-6 leading-relaxed">
        <h2 className="text-2xl font-semibold">Design Highlights</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Six-stage pipeline</strong> (IF → ID → IS → EX → CP → RT) with single-issue,
            out-of-order execution inspired by Intel’s P6 core.
          </li>
          <li>
            <strong>Register renaming</strong> via a 32-entry Map Table and a 32-entry ROB
            to remove WAR/WAW hazards and support precise exceptions.
          </li>
          <li>
            <strong>Unified 8-entry LSQ</strong> enables speculative loads and enforces
            memory ordering; ties into a direct-mapped, write-back, non-blocking D-cache.
          </li>
          <li>
            <strong>Multiple functional units</strong>—dual ALUs for branches/arithmetic
            plus an 8-stage pipelined multiplier; arbitration favours multiplier results.
          </li>
          <li>
            <strong>Misprediction recovery</strong> handled in the Retire stage; BTB/RAS
            predictor is future work, but full pipeline-flush logic is already in place.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold">Performance Snapshot</h2>
        <p>
          On the single-FU core we measured an <strong>average CPI of 10.3</strong> across
          30+ assembly tests (best 3.8, worst 30). Enabling the pipelined multiplier
          shifts the average CPI to <strong>10.6</strong>—some programs speed up, others
          slow down due to extra LSQ/ROB pressure.
        </p>

      </section>

      {/* ───── demo video (optional) ───── */}
      {/*
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Project Demo Video</h2>
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg dark:shadow-white/10">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${YOUTUBE_ID}`}
            title="Processor demo video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
      */}
      <section className="space-y-10">
        {/* baseline grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Baseline Core Metrics</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {baselineCharts.map(({ src, alt }) => (
              <ChartImage key={src} src={src} alt={alt} />
            ))}
          </div>
        </div>

        {/* comparison grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">
            Baseline&nbsp;vs.&nbsp;Multiplier-Pipelined Core
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {compareCharts.map(({ src, alt }) => (
              <ChartImage key={src} src={src} alt={alt} />
            ))}
          </div>
        </div>
      </section>

      {/* ───── paper viewer ───── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Read the Full Paper</h2>
        <div className="w-full h-[80vh] rounded-2xl overflow-hidden border shadow dark:shadow-white/10">
          <iframe
            className="w-full h-full"
            src={`${PDF_PATH}#toolbar=0&navpanes=0&scrollbar=0`}
            title="CSEE 4824 Final Report PDF"
          />
        </div>
        <p className="text-sm">
          Trouble viewing?{' '}
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
