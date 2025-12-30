"use client";

import Image from "next/image";
import "./about.css";

export default function AboutPage() {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = e.currentTarget;
        const name = (form.elements.namedItem("name") as HTMLInputElement)
            .value;
        const email = (form.elements.namedItem("email") as HTMLInputElement)
            .value;
        const description = (
            form.elements.namedItem("description") as HTMLTextAreaElement
        ).value;

        const title = encodeURIComponent(`Bug report from ${name}`);
        const body = encodeURIComponent(
            `**Name:** ${name}\n**Email:** ${email}\n\n**Issue Description:**\n${description}`
        );

        const url = `https://github.com/CrankyTitanO7/rumpus-web/issues/new?title=${title}&body=${body}`;
        window.open(url, "_blank");
    }

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
                            {/* DOWN ARROW */}
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
                                    placeholder="Your name"
                                    required
                                />
                                <input
                                    name="email"
                                    className="p-3 bg-neutral-800 text-white border border-neutral-600"
                                    placeholder="Your email"
                                    required
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
                            <h1>instructions:</h1>
                            <p>
                                when you click submit, it will redirect you to
                                our bug report page. You should be able to click
                                submit on that page. For additional assistance,
                                feel free to contact us (below)
                            </p>{" "}
                            <br />{" "}
                            <a
                                href="mailto:yalerumpus@gmail.com?subject=Name%20and%20Bug%20Report&body=Describe%20the%20issue%20here"
                                type="email"
                            >
                                yalerumpus@gmail.com
                            </a>
                        </div>
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
