'use client';

import Link from 'next/link';
import { useEffect, useId, useMemo, useState } from 'react';

const VLSI = (name: string) => `/data/vlsi/${name}`;

/**
 * Click-to-expand image card (no external libs).
 * - Click card to open fullscreen modal
 * - ESC or backdrop click closes
 * - Optional: zoom-ish cursor + scrollable modal for huge images
 */
function ExpandableImage({
  src,
  alt,
  caption,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    // prevent background scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group text-left rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500/60"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={open}
        title="Click to expand"
      >
        <div className="relative">
          {/* Plain <img> to match your existing setup; swap to next/image if you want */}
          <img
            src={src}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            className="w-full h-auto object-cover transition-transform duration-200 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/50 text-white text-xs px-3 py-1">
              Click to expand
            </div>
          </div>
        </div>

        {caption ? (
          <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{caption}</div>
        ) : null}
      </button>

      {/* Modal */}
      {open ? (
        <div
          id={dialogId}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="absolute inset-0 p-4 sm:p-8 flex items-center justify-center">
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-black/90 backdrop-blur">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{caption ?? alt}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{alt}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
                >
                  Close
                </button>
              </div>

              <div className="p-4">
                <img src={src} alt={alt} className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SectionTitle({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center space-y-3">
      {kicker ? (
        <p className="text-sm tracking-widest uppercase text-gray-500 dark:text-gray-400">
          {kicker}
        </p>
      ) : null}
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
      {subtitle ? (
        <p className="text-base sm:text-lg max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function FeatureBlock({
  title,
  blurb,
  tags,
  figures,
}: {
  title: string;
  blurb: string;
  tags?: string[];
  figures: { src: string; alt: string; caption: string; priority?: boolean }[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h3>
          <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200">{blurb}</p>

          {tags?.length ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-7 grid gap-6 md:grid-cols-2">
          {figures.map((f) => (
            <ExpandableImage
              key={f.src}
              src={f.src}
              alt={f.alt}
              caption={f.caption}
              priority={f.priority}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function VLSIMicroprocessorCorePage() {
  return (
    <main className="font-[ClashDisplay-Regular] min-h-screen bg-white text-black dark:bg-black dark:text-white">
      {/* Back */}
      <section className="container mx-auto max-w-6xl px-6 py-10">
        <Link href="/projects" className="text-blue-600 hover:underline">
          ← Back to projects
        </Link>
      </section>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-14 text-center space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          VLSI 8-bit Microprocessor Core
        </h1>
        <p className="text-lg sm:text-xl max-w-4xl mx-auto text-gray-800 dark:text-gray-200">
          For our VLSI project, we designed a simple <strong>8-bit microprocessor core</strong> end
          to end—schematic → layout → verification. The focus was building physical blocks that tile
          nicely, route cleanly, and pass <strong>DRC/LVS</strong>. This project was build with TSMCN65 technology.
        </p>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <span className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800">
            Full custom layout
          </span>
          <span className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800">
            DRC / LVS
          </span>
          <span className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800">
            Datapath + control
          </span>
        </div>
      </section>

      {/* NEW: Final full layout image right at the start */}
      <section className="mx-auto max-w-5xl px-6 pb-6">
        <ExpandableImage
          src={VLSI('final_layout.png')}
          alt="Final full layout of the 8-bit microprocessor core"
          caption="Final full layout of the complete 8-bit microprocessor core."
          priority
        />
      </section>

      {/* Overview images */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <SectionTitle
          kicker="Overview"
          title="Block diagram + instruction set"
          subtitle="The big picture: modules + data flow, and the opcode-level behavior that drives control."
        />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 grid gap-6 md:grid-cols-2">
        <ExpandableImage
          src={VLSI('block_dia.png')}
          alt="8-bit microprocessor block diagram"
          caption="Block diagram of the full 8-bit core."
        />
        <ExpandableImage
          src={VLSI('inst.png')}
          alt="Instruction set and encoding"
          caption="Instruction set + encoding (used to derive control signals)."
        />
      </section>

      {/* Modules list */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          <h2 className="text-2xl font-bold mb-3">Modules we built</h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            The core is assembled from reusable, layout-first blocks:
          </p>

          <div className="flex flex-wrap gap-2 pt-4">
            {['Latch', 'Bus Driver', 'SRAM', 'Adder', 'Shifter'].map((m) => (
              <span
                key={m}
                className="text-sm px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Floorplanning story */}
      <FeatureBlock
        title="Floorplanning: legacy blocks and the consequences"
        blurb="We started by laying out the adder and shifter first. Those early layouts were much larger and less dense than the blocks we designed later—great for learning, bad for floorplanning. We originally aimed for a clean, compact floorplan, but because the adder + shifter were already committed (and physically huge), we ended up adopting a much uglier floorplan that could actually fit them."
        tags={['Early layout debt', 'Density mismatch', 'Real constraints > aesthetic dreams']}
        figures={[
          {
            src: VLSI('goal_floorplan.png'),
            alt: 'Goal floorplan',
            caption: 'Goal floorplan',
          },
          {
            src: VLSI('actual_floorplan.png'),
            alt: 'Actual floorplan',
            caption: 'Actual floorplan',
          },
        ]}
      />

      {/* SRAM */}
      <FeatureBlock
        title="SRAM module: extreme density, powered by pure stubbornness"
        blurb="The SRAM was the module we had the most fun making. We achieved extreme density after many iterations—and an unhealthy amount of ruler usage to squeeze every spacing down to the minimum that still passes DRC. We used a classic 6T bitcell sized for read/write stability. The read path is intentionally simple: precharge bit and bit_bar during clock_low, let the selected cell pull one side down during read, and then read bit_bar with an inverter. The upside is simplicity and area efficiency. The downside is that read speed is capped by how long it takes the cell to discharge a precharged node; many modern SRAMs use sense amplifiers to detect small differentials faster. For writes, we drive bit/bit_bar low according to the intended value. A highlight: we fit the read/write logic inside the SRAM bit pitch by heavy diffusion sharing and spacing optimization."
        tags={[
          '6T bitcell',
          'Precharge/discharge read',
          'Inverter sense',
          'Diffusion sharing',
          'Pitch-matched periphery',
        ]}
        figures={[
          {
            src: VLSI('bit_stack_schematic.png'),
            alt: 'SRAM read/write logic schematic',
            caption: 'Read/write logic schematic for the SRAM bit stack.',
          },
          {
            src: VLSI('m2_m3_m4.png'),
            alt: 'SRAM routing across M2/M3/M4',
            caption: 'Routing detail across metal layers (M2/M3/M4).',
          },
          {
            src: VLSI('bit_stack_w_rulers.png'),
            alt: 'Bit stack with ruler measurements',
            caption: 'Bit-stack layout with ruler-driven optimization.',
          },
          {
            src: VLSI('bit_stack_sram_together.png'),
            alt: 'Bit stack integrated with SRAM',
            caption: 'Bit-stack + SRAM integration (pitch alignment + routing sanity).',
          },
          {
            src: VLSI('bit_stack_no_ruler.png'),
            alt: 'Bit stack layout without rulers',
            caption: 'Bit-stack layout without rulers.',
          },
          {
            src: VLSI('sram_module.png'),
            alt: 'Full SRAM module layout',
            caption: 'Full SRAM module layout snapshot.',
          },
          {
            src: VLSI('po_od.png'),
            alt: 'SRAM PO/OD detail',
            caption: 'SRAM PO/OD detail (tight diffusion sharing + density tricks).',
          },
        ]}
      />

      {/* PLA */}
      <FeatureBlock
        title="PLA design: decoder built at the end (and it shows in the density)"
        blurb="The PLA/control block was created near the end of the project, and it demonstrates how compact our later layouts became. We started from a truth table of control signals derived from the opcodes, used Espresso to simplify the sum-of-products, then implemented an extremely compact AND plane + OR plane. Like the SRAM, diffusion sharing and careful routing were the main weapons."
        tags={['Truth table → control signals', 'Espresso SOP minimization', 'AND/OR planes', 'Diffusion sharing']}
        figures={[
          {
            src: VLSI('pla_po_od.png'),
            alt: 'PLA PO/OD detail',
            caption: 'PLA PO/OD detail (compact diffusion-level implementation).',
          },
          {
            src: VLSI('pla_m1_m2.png'),
            alt: 'PLA M1/M2 routing detail',
            caption: 'PLA routing detail (M1/M2).',
          },
          {
            src: VLSI('pla_decoder.png'),
            alt: 'PLA decoder layout',
            caption: 'Decoder layout view (AND/OR planes + outputs).',
          },
          {
            src: VLSI('pla_decoder_schematic.png'),
            alt: 'PLA decoder schematic',
            caption: 'Decoder schematic derived from the minimized SOP.',
          },
        ]}
      />

      {/* Shifter */}
      <FeatureBlock
        title="Shifter design: the legacy wide-boy"
        blurb="This is where the legacy design shows up. We built an 8-bit logical left shifter using 2:1 muxes in a logarithmic structure (3 layers). Each mux is implemented as a pair of transmission gates (one pMOS + one nMOS). Because pass-transistor chains can weaken signals, we added inverter restore stages for depths ≥ 2. We also intentionally made the shifter extremely wide so it could sit directly on top of the adder and respect the (already wide) bit spacing."
        tags={['Logarithmic mux network', 'Transmission-gate mux', 'Inverter restoration', 'Bit-pitch alignment']}
        figures={[
          {
            src: VLSI('shifter_handdrawing_schematic.png'),
            alt: 'Hand-drawn shifter schematic',
            caption: 'Hand sketch of the shifter structure (mux layers / data flow).',
          },
          {
            src: VLSI('shifter_full_layout.png'),
            alt: 'Full shifter layout',
            caption: 'Full shifter layout (intentionally wide to match adder pitch).',
          },
          {
            src: VLSI('shifter_full_schematic.png'),
            alt: 'Full shifter schematic',
            caption: 'Full shifter schematic (mux network + inverter restoration).',
          },
        ]}
      />

      {/* Adder */}
      <FeatureBlock
        title="Adder design: first layout, still stackable"
        blurb="The adder was the very first layout we did, and it shows: it’s larger and less dense than our later blocks. Functionally, it’s an 8-bit ripple-carry adder built from eight full adders. Overflow is computed by XOR’ing the final carry-out with the carry-in to the MSB. Even early on, we designed with physical data flow in mind: the full-adder tile is shaped so carry chains stack cleanly, and the carry-in/out routing stays straightforward."
        tags={['8-bit ripple-carry', 'Stackable full-adder tile', 'Carry chain routing', 'Overflow (Cout ⊕ Cin)']}
        figures={[
          {
            src: VLSI('full_adder_dataflow.png'),
            alt: 'Full adder dataflow',
            caption: 'Full-adder dataflow (designed to tile and chain carry cleanly).',
          },
          {
            src: VLSI('full_adder_schematic.png'),
            alt: 'Full adder schematic',
            caption: 'Full-adder schematic used as the repeating bit-slice.',
          },
          {
            src: VLSI('full_adder_full_layout.png'),
            alt: 'Full adder full layout',
            caption: 'Full-adder layout (legacy density, but physically composable).',
          },
        ]}
      />

      {/* Footer */}
      <section className="mx-auto max-w-4xl px-6 pb-28 text-center space-y-6">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Remaining modules (latch, bus driver, mux) coming next—this page is being updated as we
          add more block deep-dives.
        </p>

        <Link
          href="/projects"
          className="inline-block px-8 py-4 rounded-full border border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 shadow-md hover:bg-gray-100 dark:hover:bg-gray-900/10 transition-colors"
        >
          Back to projects →
        </Link>
      </section>
    </main>
  );
}
