import Image from "next/image";
import "./globals.css";

import SocialButtons from "../components/socialButtons/SocialButtons";

// import Head from 'next/head';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Countdown from "../components/Countdown.js";
import Sidebar from "../components/Sidebar.js";
import { reverseTimer } from "../lib/reverseTimer";

// Use dynamic import to ensure the component is rendered only on the client
// This is good practice for components that rely heavily on browser APIs (like requestAnimationFrame)
import DynamicGameWrapper from "@/components/DynamicGameWrapper";

// global variables for easy reference

// current issue info
const reference = {
    issueurl: "https://online.fliphtml5.com/sesvj/Spring-Issue-2026", // link to next issue article viewer
    pageref: [2, 1, 14], // page numbers for the three iframes
    targetdate: "2026-09-25T20:00:00", // target date for countdown timer
};

// IMPORTANT DEVELOPER NOTE: WHEN SPECIFYING TARGET DATE YOU MUST USE 2 DIGIT NUMBERS
// ie "2024-09-05T09:07:00" NOT "2024-9-5T9:7:00"

// queue up next issue info
const referenceNext = {
    issueurl: "https://online.fliphtml5.com/sesvj/Spring-Issue-2026", // link to next issue article viewer
    pageref: [2, 1, 14], // page numbers for the three iframes
    targetdate: reference.targetdate, // target date for countdown timer
    // dateform: new Date(reference.targetdate)
};

const timer = reverseTimer(new Date(reference.targetdate)); // check if target date has passed
const timeZero = timer.days === 0 && timer.hours === 0 && timer.minutes === 0 && timer.seconds === 0;

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
                <div className="header" id="top" style={{ display: "flex", justifyContent: "center" }}>
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
                            className="header-logo"
                        >
                            <Image
                                src="/rumpus-online-logo.png"
                                alt="the Yale Rumpus Logo"
                                width={541}
                                height={193}
                                style={{ maxWidth: "100%", height: "auto" }}
                                priority
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
                            className="header-figure"
                        >
                            <Image
                                src="/oldest-college-tab.png"
                                alt="Oldest College Tab"
                                width={150}
                                height={140}
                                style={{ maxWidth: "100%", height: "auto" }}
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
                        <Sidebar linkColor="alicewhite" />
                    </div>
                </div>

                {/* ---- STACKED CARD SCROLLER ---- */}
                <section className="c-rumpus">
                    <ul className="c-rumpus__list">
                        {/* ----------------- CARD 0: featured ----------------- */}
                        <article className="c-rumpus__item" id="section0">
                            <div className="c-rumpus__item-figure c-rumpus__gradient-top"></div>

                            <div className="c-rumpus__item-info">
                                <h2 className="c-rumpus__item-title">Featured</h2>
                                <div className="rumpus-top-issues">
                                    {/* LEFT COLUMN */}
                                    <div className="rumpus-top-left">
                                        {/* Top left row */}
                                        <div className="rumpus-top-row">
                                            <div className="rumpus-top-blurb"></div>

                                            {/* IFRAME 1 */}
                                            <div className="bevel-wrap">
                                                <div style={{ border: "none", height: "290", width: "100%" }}>
                                                    bottom right{" "}
                                                </div>
                                            </div>
                                        </div>

                                        {/* IFRAME 3 */}
                                        <div className="bevel-wrap">
                                            <div style={{ border: "none", height: "290", width: "100%" }}>
                                                bottom left
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN IFRAME */}
                                    <div className="rumpus-top-right bevel-wrap">
                                        <div style={{ border: "none", height: "600", width: "100%" }}> right col</div>
                                    </div>
                                </div>
                            </div>
                        </article>
                        {/* ----------------- CARD 1: COUNTDOWN ----------------- */}
                        <article className="c-rumpus__item" id="section1">
                            <div className="c-rumpus__item-figure c-rumpus__gradient-mid"></div>

                            <div className="c-rumpus__item-info">
                                <h2 className="c-rumpus__item-title">Countdown to New Issue:</h2>

                                <div className="rumpus-countdown-wrap">
                                    <Countdown targetDate={new Date(endref.targetdate)} html={true} />
                                </div>
                            </div>
                        </article>

                        {/* ----------------- CARD 2: TOP ISSUES ----------------- */}
                        <article className="c-rumpus__item" id="section2">
                            <div className="c-rumpus__item-figure c-rumpus__gradient-mid"></div>

                            <div className="c-rumpus__item-info">
                                <h2 className="c-rumpus__item-title">our top issues:</h2>

                                <div className="rumpus-top-issues">
                                    {/* LEFT COLUMN */}
                                    <div className="rumpus-top-left">
                                        {/* Top left row */}
                                        <div className="rumpus-top-row">
                                            <div className="rumpus-top-blurb">
                                                <h3>Issue Highlight</h3>
                                                <h4>
                                                    <a href="/reader">click here for large page viewer!</a>
                                                </h4>
                                                <p>hey there sexy. read the rumpus.</p>

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

                        {/* ----------------- CARD 3: ongoing surveys ----------------- */}
                        {/* <article className="c-rumpus__item">

                            <div className="c-rumpus__item-figure c-rumpus__gradient-bottom"></div>

                            <div className="c-rumpus__item-info">
                                <h2 className="c-rumpus__item-title">Ongoing Surveys</h2>

                                <Link href="" style={{ display: 'block', textAlign: 'center' }}>
                                    <Image
                                        src="/surveyQR.png"
                                        alt="survey qr code and link"
                                        width={300}
                                        height={300}
                                        style={{ margin: '0 auto' }}
                                    />
                                </Link>
                            </div>
                        </article> */}

                        {/* ----------------- CARD 4: GAMES ----------------- */}
                        <article className="c-rumpus__item" id="section4">
                            <div className="c-rumpus__item-figure c-rumpus__gradient-bottom"></div>

                            <div className="c-rumpus__item-info">
                                <h1 className="c-rumpus__item-title">G A M E S</h1>
                                <p> brought to you with love from the Rumpus game department (we're hiring!) </p>
                                <main style={{ margin: "0 auto" }}>
                                    <DynamicGameWrapper />
                                </main>
                            </div>
                        </article>
                    </ul>
                </section>
                {/* bottom right buttons (social media) */}
                {/* KEEP THIS HERE so that it appears at bottom on mobile */}
                <SocialButtons />

                {/* vercel analytics */}
                <Analytics />
                <SpeedInsights />
            </>
        )
    );
}
