"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Sidebar({ linkColor }) {
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
        const headerEl = document.querySelector("#top");
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
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setOpen(false);
    };

    return (
        <>
            {/* Top bar (visible when header is visible) */}
            <nav className="topbar">
                {(() => {
                    // headlines here!
                    const headlines = [
                        "find epstein files at jmail.world",
                        "who even reads these??",
                        "you've reached the rumpus",
                        "play our games!",
                    ];
                    // here are the links that you can click on for each headline item
                    const links = [
                        "https://jmail.world/",
                        "",
                        "",
                        "#section4",
                    ]

                    return (
                        <div
                            className="scrolling-headlines"
                            aria-label="Latest headlines"
                            role="region"
                        >
                            <div className="ticker">
                                <div className="ticker-track">
                                    {headlines.concat(headlines).map((h, i) => {
                                        const url = links[i % links.length];
                                        return (
                                            <span className="ticker-item" key={i}>
                                                <a href={url || undefined} target={url ? "_blank" : undefined} rel={url ? "noopener noreferrer" : undefined} style={{color:linkColor}}>
                                                {h}
                                                </a>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <style>{`
                .scrolling-headlines { width: 100%; overflow: hidden; box-sizing: border-box; }
                .ticker { display: block; width: 100%; overflow: hidden; }
                .ticker-track { display: inline-flex; gap: 48px; white-space: nowrap; animation: ticker-scroll 18s linear infinite; }
                .ticker-item { font-size: 16px; display: inline-block; padding: 8px 0; }
                .ticker-item:hover { text-decoration: underline; }
                @keyframes ticker-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                /* Pause on hover */
                .scrolling-headlines:hover .ticker-track { animation-play-state: paused; }
              `}</style>
                        </div>
                    );
                })()}
                <ul>
                    <li>
                        <a href="#top" onClick={(e) => handleNav(e, "#top")}>
                            top of page
                        </a>
                    </li>
                    <li>
                        <a
                            href="#section1"
                            onClick={(e) => handleNav(e, "#section1")}
                        >
                            Countdown
                        </a>
                    </li>
                    <li>
                        <a
                            href="#section2"
                            onClick={(e) => handleNav(e, "#section2")}
                        >
                            Latest Issue
                        </a>
                    </li>
                    <li>
                        <a
                            href="/archive"
                        >
                            Past Issues
                        </a>
                    </li>
                    <li>
                        <a
                            href="#section4"
                            onClick={(e) => handleNav(e, "#section4")}
                        >
                            Games
                        </a>
                    </li>
                    <li>
                        <Link href="/about">About/Contact</Link>
                    </li>
                    <li>
                        <Link href="/blog">Blog</Link>
                    </li>
                    <li>
                        <Link href="/surveys">Surveys</Link>
                    </li>
                    <li>
                        <Link href="/yalies-ranking">the Yankings</Link>
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
                    <button
                        className="sidebar-handle"
                        aria-label="Open sidebar"
                        style={{ top: "10px" }}
                    >
                        ☰
                    </button>

                    <aside className={`sidebar ${open ? "open" : ""}`}>
                        <ul>
                            <li>
                                <a
                                    href="#top"
                                    onClick={(e) => handleNav(e, "#top")}
                                >
                                    top of page
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#section1"
                                    onClick={(e) => handleNav(e, "#top")}
                                >
                                    Countdown
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#section2"
                                    onClick={(e) => handleNav(e, "#section2")}
                                >
                                    Latest Issue
                                </a>
                            </li>
                            {/* <li>
                <a href="#section3" onClick={(e) => handleNav(e, '#section3')}>Past Issues</a>
              </li> */}
                            <li>
                                <a
                                    href="#section4"
                                    onClick={(e) => handleNav(e, "#section4")}
                                >
                                    Games
                                </a>
                            </li>
                            <li>
                                <Link href="/about">About/Contact</Link>
                            </li>
                            <li>
                                <Link href="/blog">Blog</Link>
                            </li>
                            <li>
                                <Link href="/surveys">Surveys</Link>
                            </li>
                            <li>
                                <Link href="/yalies-ranking">the Yankings</Link>
                            </li>
                        </ul>
                    </aside>
                </div>
            )}

            <style>{`
        
      `}</style>
        </>
    );
}
