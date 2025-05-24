// components/ChartImage.tsx
'use client';
import React from 'react';
import Image from 'next/image';

type Props = { src: string; alt: string };

export default function ChartImage({ src, alt }: Props) {
  const [open, setOpen] = React.useState(false);

  // close on Esc
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* thumbnail */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus:outline-none"
      >
        <Image
          src={src}
          alt={alt}
          width={600}
          height={400}
          className="w-full h-auto rounded-2xl shadow dark:shadow-white/10 object-contain"
        />
      </button>

      {/* lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <Image
            src={src}
            alt={alt}
            width={2400}
            height={1800}
            className="max-h-[90vh] w-auto rounded-2xl object-contain border shadow-lg dark:shadow-white/10"
          />
        </div>
      )}
    </>
  );
}
