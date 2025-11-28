'use client';

import React, { useState, useEffect, useRef } from "react";

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
            </ul>
          </aside>
        </div>
      )}

      <style>{`
        /* Top bar styles */
        .topbar {
          // position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #333;
          padding: 12px 20px;
          // z-index: 999;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
          width: 36px;
          height: 36px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 0 6px 6px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
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
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}