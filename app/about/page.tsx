'use client';

import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <section className="w-full">
        <h1>About and Contact</h1>
        <p>All about the single best asses on campus</p>

        <div className="flex flex-row items-start justify-center gap-12 mt-12">
          {/* LEFT: IMAGE */}
          <div className="shrink-0">
            <Image
              src="/authors.png"
              alt="list of the authors"
              width={240}
              height={240}
              priority
            />
          </div>

          {/* RIGHT: CONTENT */}
          <div className="flex flex-col gap-10 max-w-md">
            {/* LEFT ARROW */}
            <div className="flex flex-row items-center gap-4">
              <svg className="arrow arrow-1" width="60" height="40" viewBox="0 0 36 24">
                <path
                  className="arrow-path"
                  d="M34 12 H8 M16 4 L8 12 L16 20"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Meet the authors behind the project</span>
            </div>
            
            {/* DOWN ARROW */}
            <div className="flex flex-row items-start gap-4">
              <svg className="arrow arrow-2" width="60" height="80" viewBox="0 0 24 36">
                <path
                  className="arrow-path"
                  d="M12 2 V28 M4 20 L12 28 L20 20"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Get in touch with us below</span>
            </div>

            {/* FORM */}
            <form className="flex flex-col gap-4">
              <input className="p-3 bg-neutral-800 text-white border border-neutral-600" placeholder="Your name" />
              <input className="p-3 bg-neutral-800 text-white border border-neutral-600" placeholder="Your email" />
              <textarea className="p-3 bg-neutral-800 text-white border border-neutral-600" placeholder="Message" />
              <button className="p-3 bg-white text-black font-semibold">Submit</button>
            </form>
          </div>
        </div>
      </section>

      {/* ✅ MUST be inside the component */}
      <style jsx>{`
        .arrow-path {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: draw-arrow 1.2s ease-out forwards;
        }

        /* SEQUENCE DELAYS */
        .arrow-1 .arrow-path {
          animation-delay: 0.2s;
        }

        .arrow-2 .arrow-path {
          animation-delay: 0.8s;
        }

        @keyframes draw-arrow {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </>
  );
}
