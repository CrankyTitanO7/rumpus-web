"use client";

import { useState } from "react";



export default function BlogSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [open, setOpen] = useState(false);

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
            {/* Mobile toggle button */}
            <button
                className="blog-sidebar-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
            >
                ☰ Menu
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="blog-sidebar-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={isOpen ? "mobile-open" : ""}>
                <button
                    className="blog-sidebar-close"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close menu"
                >
                    ×
                </button>
                <ul>
                    <li>
                        <a href="/" onClick={() => setIsOpen(false)}>Home</a>
                    </li>
                    <li>
                        Blog:
                        <ul>
                            <li>
                                <a href="/blog" onClick={() => setIsOpen(false)}>All Posts</a>
                            </li>
                            <li>
                                <a href="#top" onClick={(e) => handleNav(e, "#top")}>
                                    top of page
                                </a>
                            </li>
                            <li>
                                <a href="#git" onClick={(e) => setIsOpen(false)}>GitHub Page</a>
                            </li>
                            <li>
                                <a href="#blog" onClick={(e) => setIsOpen(false)}>Official Blog Notes</a>
                            </li>
                            <li>
                                <a href="#commits" onClick={(e) => setIsOpen(false)}>Recent Commits</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </aside>
        </>
    );
}
