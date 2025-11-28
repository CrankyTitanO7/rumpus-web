'use client';

import React, { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
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
            <a href="#top">top of page</a>
          </li>
          <li>
            <a href="#section1">Countdown to Latest Issue</a>
          </li>
          <li>
            <a href="#section2">Latest Issue</a>
          </li>
          <li>
            <a href="#section3">Past Issues</a>
          </li>
        </ul>
      </aside>

      <style>{`
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
          top: 10px; /* Adjusted to top left */
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
        }

        .sidebar a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}