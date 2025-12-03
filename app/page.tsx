import Image from "next/image";
import './globals.css'
import Link from 'next/link';

// import Head from 'next/head';
import Sidebar from '../components/Sidebar.js'; 
import Countdown from '../components/Countdown.js';

// Use dynamic import to ensure the component is rendered only on the client
// This is good practice for components that rely heavily on browser APIs (like requestAnimationFrame)
import DynamicGameWrapper from '@/components/DynamicGameWrapper';

export default function RumpusHomePage(){
  return (
<>
{/* The main header */}
<div className="header" id="top" style={{ display: 'flex', justifyContent: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', maxWidth: '1200px', width: '100%', padding: '16px' }}>
        <div style={{ flex: '1 1 60%', minWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Image
            src="/rumpus-online-logo.png"
            alt="the Yale Rumpus Logo"
            width={541}
            height={193}
            />
            <p style={{ fontStyle: 'italic', textAlign: 'center', color: 'white'}}>the only news at Yale about stuff at Yale</p>
            
        </div>
        
        <figure style={{ flex: '0 0 240px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 0 }}>
            <Image
            src="/oldest-college-tab.png"
            alt="Oldest College Tab"
            width={150}
            height={140}
            />
            <figcaption style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.9rem', color: '#000000ff' }}>
                now with GAMES
            </figcaption>
        </figure>
        
        {/* The sidebar component */}
        <Sidebar />
    </div>
</div>



{/* The main content area */}
<div id="content">
    <div className="section" id="section1">
        <div className="overcast-css -effect" style={{backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.58))', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            <h2 style= {{margin: 0 }}>COUNTDOWN TO LATEST ISSUE:</h2>
            <div className="rumpus-countdown-wrap">
                <Countdown targetDate={new Date('2025-12-31T16:13:30')} /> {/* Set your target date here */}
            </div>
        </div>
    </div>
    
    <div className="section" id="section2" style={{backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.58),rgba(255, 255, 255, 0))', backgroundSize: 'cover', backgroundPosition: 'center'}}> 
        <h2>our top issues:</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Left column: two stacked iframes */}
            <div style={{ flex: '0 0 48%', display: 'flex', flexDirection: 'column', gap: '16px', marginRight: '16px', marginLeft: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ flex: '0 0 60%', padding: '12px' }}>
                        <h3 style={{ margin: 0 }}>Issue Highlight</h3>
                        <p style={{ marginTop: '8px' }}>
                            Short blurb about this issue — featured article, theme, or notable photos.
                            Keep it concise so it sits neatly beside the upright viewer.
                        </p>
                        <p style={{ marginTop: '8px' }}>
                            <a href="https://online.fliphtml5.com/sesvj/zjfg/#p=16" target="_blank" rel="noopener noreferrer">
                                Read the full issue
                            </a>
                        </p>
                    </div>
                    
                    <div className="bevel-wrap" style={{ flex: '1 1 40%' }}>
                        <iframe
                        src="https://online.fliphtml5.com/sesvj/zjfg/#p=16"
                        width="100%"
                        height="290"
                        style={{ border: 'none' }}
                        title="Latest Issue - top"
                        />
                    </div>
                </div>
                
                <div className="bevel-wrap"> <iframe
                    src="https://online.fliphtml5.com/sesvj/zjfg/#p=8"
                    width="100%"
                    height="290"
                    style={{ border: 'none' }}
                    title="Latest Issue - bottom"
                    /></div>
                </div>
                
                {/* Right column: one large iframe */}
                <div className="bevel-wrap" style={{ flex: '0 0 48%' }}>
                    <iframe
                    src="https://online.fliphtml5.com/sesvj/zjfg/#p=1"
                    width="100%"
                    height="600"
                    style={{ border: 'none' }}
                    title="Latest Issue - large"
                    />
                </div>
            </div>
        </div>
        
        <div className="section" id="section3">
            <h2>PAST ISSUES:</h2>
            {/* NOTE: Replace 'archive.html' with the Next.js Link component route for production */}
            <Link href="/past-issues">
                {/* Replace <img> with Next.js <Image> for optimization in a real app */}
                    <Image 
                    src="/past_issues.png" 
                    alt="Link to Past Issues" 
                    width="300" 
                    height="400"
                    />
                </Link>
            </div>
            
            <div className="section" id="section4">
                <h2>G A M E S</h2>
                <main>
                    <h1 style={{ textAlign: 'center' }}>Flappy Bird in Next.js/React</h1>
                    {/* 3. Render the client wrapper component */}
                    <DynamicGameWrapper />
                </main>
            </div>
        </div>
        
        {/* The fixed navigation bar
            <div className="navbar">
                <a href="#top">top of page</a>
                <a href="#news">News</a>
                <a href="#contact">Contact</a>
            </div> */}
            </>
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
  