import Image from "next/image";
import "./globals.css";
import Link from "next/link";

// import Head from 'next/head';
import Sidebar from "../components/Sidebar.js";
import Countdown from "../components/Countdown.js";
import { reverseTimer } from "../lib/reverseTimer";

// Use dynamic import to ensure the component is rendered only on the client
// This is good practice for components that rely heavily on browser APIs (like requestAnimationFrame)
import DynamicGameWrapper from "@/components/DynamicGameWrapper";

// global variables for easy reference

// current issue info
const reference = {
    issueurl: "https://online.fliphtml5.com/sesvj/zjfg/", // link to current article viewer
    pageref: [16, 1, 8], // page numbers for the three iframes
    targetdate: "2025-12-31T15:13:30", // target date for countdown timer
};

// queue up next issue info
const referenceNext = {
    issueurl: "https://online.fliphtml5.com/sesvj/iljc/", // link to next issue article viewer
    pageref: [12, 1, 5], // page numbers for the three iframes
    targetdate: reference.targetdate, // target date for countdown timer
    // dateform: new Date(reference.targetdate)
};

const timer = reverseTimer(new Date(reference.targetdate)); // check if target date has passed
const timeZero =
    timer.days === 0 &&
    timer.hours === 0 &&
    timer.minutes === 0 &&
    timer.seconds === 0;

// final reference object to use in the page
const endref = {
    issueurl: timeZero ? referenceNext.issueurl : reference.issueurl, // link to current article viewer
    pageref: timeZero ? referenceNext.pageref : reference.pageref, // page numbers for the three iframes
    targetdate: reference.targetdate, // target date for countdown timer
};

export default function RumpusHomePage() {
    return (
        console.log(endref),
        (
            // console.log(timeZero),
            <>
                {/* The main header */}
                <div
                    className="header"
                    id="top"
                    style={{ display: "flex", justifyContent: "center" }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: "24px",
                            flexWrap: "wrap",
                            maxWidth: "1200px",
                            width: "100%",
                            padding: "16px",
                        }}
                    >
                        <div
                            style={{
                                flex: "1 1 60%",
                                minWidth: "280px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Image
                                src="/rumpus-online-logo.png"
                                alt="the Yale Rumpus Logo"
                                width={541}
                                height={193}
                            />
                            <p
                                style={{
                                    fontStyle: "italic",
                                    textAlign: "center",
                                    color: "white",
                                }}
                            >
                                the only news at Yale about stuff at Yale
                            </p>
                        </div>

                        <figure
                            style={{
                                flex: "0 0 240px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                margin: 0,
                            }}
                        >
                            <Image
                                src="/oldest-college-tab.png"
                                alt="Oldest College Tab"
                                width={150}
                                height={140}
                            />
                            <figcaption
                                style={{
                                    marginTop: "8px",
                                    textAlign: "center",
                                    fontSize: "0.9rem",
                                    color: "#000000ff",
                                }}
                            >
                                now with GAMES
                            </figcaption>
                        </figure>

                        {/* The sidebar component */}
                        <Sidebar />
                    </div>
                </div>

                {/* ---- STACKED CARD SCROLLER ---- */}
                <section className="c-rumpus">
                    <ul className="c-rumpus__list">
                        {/* ----------------- CARD 1: COUNTDOWN ----------------- */}
                        <article className="c-rumpus__item" id="section1">
                            <div className="c-rumpus__item-figure c-rumpus__gradient-top"></div>

                            <div className="c-rumpus__item-info">
                                <h2 className="c-rumpus__item-title">
                                    COUNTDOWN TO LATEST ISSUE:
                                </h2>

                                <div className="rumpus-countdown-wrap">
                                    <Countdown
                                        targetDate={new Date(endref.targetdate)}
                                        html={true}
                                    />
                                </div>
                            </div>
                        </article>

                        {/* ----------------- CARD 2: TOP ISSUES ----------------- */}
                        <article className="c-rumpus__item" id="section2">
                            <div className="c-rumpus__item-figure c-rumpus__gradient-mid"></div>

                            <div className="c-rumpus__item-info">
                                <h2 className="c-rumpus__item-title">
                                    our top issues:
                                </h2>

                                <div className="rumpus-top-issues">
                                    {/* LEFT COLUMN */}
                                    <div className="rumpus-top-left">
                                        {/* Top left row */}
                                        <div className="rumpus-top-row">
                                            <div className="rumpus-top-blurb">
                                                <h3>Issue Highlight</h3>
                                                <h4>
                                                    <a href="/reader">
                                                        click here for large
                                                        page viewer!
                                                    </a>
                                                </h4>
                                                <p>
                                                    Short blurb about this issue
                                                    — featured article, theme,
                                                    or notable photos.
                                                </p>

                                                <p>
                                                    <a
                                                        href={`${endref.issueurl}#p=${endref.pageref[0]}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Read the full issue
                                                    </a>
                                                </p>
                                            </div>

                                            {/* IFRAME 1 */}
                                            <div className="bevel-wrap">
                                                <iframe
                                                    src={`${endref.issueurl}#p=${endref.pageref[0]}`}
                                                    height="290"
                                                    width="100%"
                                                    style={{ border: "none" }}
                                                />
                                            </div>
                                        </div>

                                        {/* IFRAME 3 */}
                                        <div className="bevel-wrap">
                                            <iframe
                                                src={`${endref.issueurl}#p=${endref.pageref[2]}`}
                                                height="290"
                                                width="100%"
                                                style={{ border: "none" }}
                                            />
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN IFRAME */}
                                    <div className="rumpus-top-right bevel-wrap">
                                        <iframe
                                            src={`${endref.issueurl}#p=${endref.pageref[1]}`}
                                            height="600"
                                            width="100%"
                                            style={{ border: "none" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* ----------------- CARD 3: PAST ISSUES ----------------- */}
                        {/* <article className="c-rumpus__item">

            <div className="c-rumpus__item-figure c-rumpus__gradient-bottom"></div>

            <div className="c-rumpus__item-info">
              <h2 className="c-rumpus__item-title">PAST ISSUES:</h2>

              <Link href="/past-issues" style={{ display: 'block', textAlign: 'center' }}>
                <Image
                  src="/past_issues.png"
                  alt="Link to Past Issues"
                  width={300}
                  height={400}
                  style={{ margin: '0 auto' }}
                />
              </Link>
            </div>
          </article> */}

                        {/* ----------------- CARD 4: GAMES ----------------- */}
                        <article className="c-rumpus__item" id="section4">
                            <div className="c-rumpus__item-figure c-rumpus__gradient-bottom"></div>

                            <div className="c-rumpus__item-info">
                                <h1 className="c-rumpus__item-title">
                                    G A M E S
                                </h1>
                                <p>
                                    {" "}
                                    brought to you with love from the Rumpus
                                    game department (we're hiring!){" "}
                                </p>
                                <main style={{ margin: "0 auto" }}>
                                    <DynamicGameWrapper />
                                </main>
                            </div>
                        </article>
                    </ul>
                </section>
            </>
        )
    );
}

// default landing page (auto generated)
// uncomment to find links to documentation, etc

// export function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//     <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//     <Image
//     className="dark:invert"
//     src="/next.svg"
//     alt="Next.js logo"
//     width={100}
//     height={20}
//     priority
//     />
//     <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//     <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//     To get started, edit the page.tsx file.
//     </h1>
//     <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//     Looking for a starting point or more instructions? Head over to{" "}
//     <a
//     href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//     className="font-medium text-zinc-950 dark:text-zinc-50"
//     >
//     Templates
//     </a>{" "}
//     or the{" "}
//     <a
//     href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//     className="font-medium text-zinc-950 dark:text-zinc-50"
//     >
//     Learning
//     </a>{" "}
//     center.
//     </p>
//     </div>
//     <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//     <a
//     className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//     href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//     target="_blank"
//     rel="noopener noreferrer"
//     >
//     <Image
//     className="dark:invert"
//     src="/vercel.svg"
//     alt="Vercel logomark"
//     width={16}
//     height={16}
//     />
//     Deploy Now
//     </a>
//     <a
//     className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//     href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//     target="_blank"
//     rel="noopener noreferrer"
//     >
//     Documentation
//     </a>
//     </div>
//     </main>
//     </div>
//   );
// }
