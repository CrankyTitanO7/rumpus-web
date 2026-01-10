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
                <nav className="sidebar-nav">
                    <a href="/" className="sidebar-link" onClick={() => setIsOpen(false)}>Home</a>
                    <div className="sidebar-section">
                        <span className="sidebar-section-title">Blog</span>
                        <a href="/blog" className="sidebar-link" onClick={() => setIsOpen(false)}>All Posts</a>
                        <a href="#top" className="sidebar-link" onClick={(e) => handleNav(e, "#top")}>
                            Top of Page
                        </a>
                        <a href="#git" className="sidebar-link" onClick={(e) => setIsOpen(false)}>GitHub Page</a>
                        <a href="#blog" className="sidebar-link" onClick={(e) => setIsOpen(false)}>Official Blog Notes</a>
                        <a href="#commits" className="sidebar-link" onClick={(e) => setIsOpen(false)}>Recent Commits</a>
                    </div>
                </nav>
            </aside>
        </>
    );
}
