"use client";

import Image from "next/image";
import "./about.css";

export default function AboutPage() {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;

        const payload = {
            name:
                (form.elements.namedItem("name") as HTMLInputElement)?.value ||
                "Anonymous",
            email:
                (form.elements.namedItem("email") as HTMLInputElement)?.value ||
                "Not provided",
            description: (
                form.elements.namedItem("description") as HTMLTextAreaElement
            ).value,
        };

        const res = await fetch("/api/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            alert("Bug report submitted successfully!");
            form.reset();
        } else {
            alert("Failed to submit bug report.");
        }
    }

    return (
        <>
            <section className="w-full">
                <div id="head">
                    <h1>About and Contact</h1>
                    <p>All about the single best asses on campus</p>
                </div>

                <div id="head">
                    <h2>
                        <a href="/">return Home</a>
                    </h2>
                </div>

                <div
                    className="flex flex-row items-start justify-center gap-12 mt-12"
                    id="about-authors"
                >
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
                        <div className="flex flex-row items-center gap-4 arrow-container-1">
                            <svg
                                className="arrow arrow-1"
                                width="60"
                                height="40"
                                viewBox="0 0 36 24"
                            >
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

                        <div id="report-bug" className="report-bug">
                            <div className="flex flex-row items-start gap-4">
                                <svg
                                    className="arrow arrow-2"
                                    width="60"
                                    height="80"
                                    viewBox="0 0 24 36"
                                >
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
                                <span>Report a Bug Issue below:</span>
                            </div>

                            {/* FORM */}
                            <form
                                className="flex flex-col gap-4"
                                onSubmit={handleSubmit}
                            >
                                <input
                                    name="name"
                                    className="p-3 bg-neutral-800 text-white border border-neutral-600"
                                    placeholder="Your name (optional)"
                                />
                                <input
                                    name="email"
                                    className="p-3 bg-neutral-800 text-white border border-neutral-600"
                                    placeholder="Your email (optional)"
                                />
                                <textarea
                                    name="description"
                                    className="p-3 bg-neutral-800 text-white border border-neutral-600"
                                    placeholder="Description of issue"
                                    required
                                />
                                <button className="p-3 bg-white text-black font-semibold">
                                    Submit
                                </button>
                            </form>

                            <p className="text-sm opacity-80">
                                Submitting will create a private GitHub issue for
                                our team. No account required.
                            </p>

                            <h2 className="mt-4">
                                <a href="mailto:yalerumpus@gmail.com">
                                    yalerumpus@gmail.com
                                </a>
                            </h2>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .arrow-path {
                    stroke-dasharray: 120;
                    stroke-dashoffset: 120;
                    animation: draw-arrow 1.2s ease-out forwards;
                }

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
