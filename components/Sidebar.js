'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const headerRef = useRef(null);

  // Intersection Observer to detect if header is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeaderVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    // Get the header element (id="top")
    const headerEl = document.querySelector('#top');
    if (headerEl) {
      observer.observe(headerEl);
    }

    return () => {
      if (headerEl) observer.unobserve(headerEl);
    };
  }, []);

  // Smooth-scroll navigation handler
  const handleNav = (e, hash) => {
    e.preventDefault();
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setOpen(false);
  };

  return (
    <>
      {/* Top bar (visible when header is visible) */}
      <nav className="topbar">
        {(() => {
          const headlines = [
            "what the FUCK is a CRIMSON?!?!?",
            "suck my YICK",
            "the curse of KAO",
            "THE GAME is just a formality",
            "damn Harvard, no funding?"
          ];

          return (
            <div className="scrolling-headlines" aria-label="Latest headlines" role="region">
              <div className="ticker">
                <div className="ticker-track">
                  {headlines.concat(headlines).map((h, i) => (
                    <span className="ticker-item" key={i}>{h}</span>
                  ))}
                </div>
              </div>

              <style>{`
                .scrolling-headlines { width: 100%; overflow: hidden; box-sizing: border-box; }
                .ticker { display: block; width: 100%; overflow: hidden; }
                .ticker-track { display: inline-flex; gap: 48px; white-space: nowrap; animation: ticker-scroll 18s linear infinite; }
                .ticker-item { color: #000000ff; font-size: 16px; display: inline-block; padding: 8px 0; }
                .ticker-item:hover { text-decoration: underline; }
                @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                /* Pause on hover */
                // .scrolling-headlines:hover .ticker-track { animation-play-state: paused; }
              `}</style>
            </div>
          );
        })()}
          <ul>
            <li>
              <a href="#top" onClick={(e) => handleNav(e, '#top')}>top of page</a>
            </li>
            <li>
              <a href="#section1" onClick={(e) => handleNav(e, '#section1')}>Countdown</a>
            </li>
            <li>
              <a href="#section2" onClick={(e) => handleNav(e, '#section2')}>Latest Issue</a>
            </li>
            <li>
              <a href="#section3" onClick={(e) => handleNav(e, '#section3')}>Past Issues</a>
            </li>
            <li>
              <a href="#section4" onClick={(e) => handleNav(e, '#section4')}>Games</a>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
          </ul>
        </nav>

      {/* Side sidebar (visible when header is NOT visible) */}
      {!headerVisible && (
        <div
          className="sidebar-wrapper"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button className="sidebar-handle" aria-label="Open sidebar" style={{ top: '10px' }}>
            ☰
          </button>

          <aside className={`sidebar ${open ? "open" : ""}`}>
            <ul>
              <li>
                <a href="#top" onClick={(e) => handleNav(e, '#top')}>top of page</a>
              </li>
              <li>
                <a href="#section1" onClick={(e) => handleNav(e, '#section1')}>Countdown</a>
              </li>
              <li>
                <a href="#section2" onClick={(e) => handleNav(e, '#section2')}>Latest Issue</a>
              </li>
              <li>
                <a href="#section3" onClick={(e) => handleNav(e, '#section3')}>Past Issues</a>
              </li>
              <li>
                <a href="#section4" onClick={(e) => handleNav(e, '#section4')}>Games</a>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </aside>
        </div>
      )}

      <style>{`
        /* Top bar styles */
        .topbar {
          // position: fixed;
          top: 12px;
          left: 12px;
          right: 12px;
          width: auto;
          background-image: linear-gradient(to bottom, #ffffff3b, #230909);
          padding: 12px 20px;
          z-index: 999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          box-sizing: border-box;
          border-radius: 12px; /* smooth corners */
          overflow: hidden;    /* ensure rounded corners clip children */

            /* Frosted glass */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* Soft bevel edges */
  box-shadow:
    inset 2px 2px 6px rgba(255, 255, 255, 0.35),   /* light top-left highlight */
    inset -2px -2px 6px rgba(0, 0, 0, 0.35),       /* dark bottom-right shade */
    0 4px 10px rgba(0,0,0,0.3);                    /* outer drop shadow */
        }

        .topbar ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 20px;
          align-items: center;
          justify-content: center;
        }

        .topbar li {
          margin: 0;
          border: none;
          padding: 0;
        }

        .topbar a {
          color: #f2f2f2;
          text-decoration: none;
          font-size: 16px;
          transition: color 0.2s;
        }

        .topbar a:hover {
          color: #ddd;
        }

        /* Sidebar styles (side icon + drawer) */
        .sidebar-wrapper {
          position: fixed;
          left: 0;
          top: 0;
          height: 100%;
          z-index: 1000;
        }

        .sidebar-handle {
          position: absolute;
          left: 0;
          top: 10px;
          transform: translateY(0);
          width: 50px;
          height: 50px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 0 6px 6px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 30px;
          padding: 0;
        }

        .sidebar {
          position: absolute;
          left: 0;
          top: 0;
          width: 220px;
          height: 100%;
          background: #000000ff;
          padding: 16px;
          box-shadow: 2px 0 8px rgba(209, 39, 39, 0.57);
          transform: translateX(-100%);
          transition: transform 180ms ease;
        }

        .sidebar.open {
          transform: translateX(0);
        }

        .sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar li + li {
          margin-top: 8px;
          border-top: 1px solid #444;
          padding-top: 8px;
        }

        .sidebar a {
          color: white;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}