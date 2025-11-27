import Image from "next/image";
import './globals.css'

// import Head from 'next/head';
import Sidebar from '../components/Sidebar.js'; 
import Countdown from '../components/Countdown.js';

export default function RumpusHomePage(){
  return (
    <>
    {/* The main header */}
    <div className="header" id="top">
    <h1>R U M P U S!</h1>
    <p style={{ fontStyle: 'italic' }}>the only news at Yale about stuff at Yale</p>
    </div>
    
    {/* The sidebar component */}
    <Sidebar />
    
    {/* The main content area */}
    <div id="content">
    <div className="section" id="section1">
    <h2>COUNTDOWN TO LATEST ISSUE:</h2>
    <div className="rumpus-countdown-wrap">
    <Countdown targetDate={new Date('2025-12-31T23:59:59')} /> {/* Set your target date here */}
    </div>
    </div>
    
    <div className="section" id="section2"> 
    <h2>LATEST ISSUE:</h2>
    {/*
      NOTE: Using an iframe is fine, but be mindful of performance and security.
      In a real Next.js app, you might look into embedding or rendering the content directly.
      */}
      <iframe 
      src="https://online.fliphtml5.com/sesvj/zjfg/#p=1" 
      width="100%" 
      height="600px" 
      style={{ border: 'none' }} // Inline styles in React use camelCase objects
      title="Latest Issue of RUMPUSTM"
      ></iframe>
      </div>
      
      <div className="section" id="section3">
      <h2>PAST ISSUES:</h2>
      {/* NOTE: Replace 'archive.html' with the Next.js Link component route for production */}
      <a href="archive.html"> 
      {/* Replace <img> with Next.js <Image> for optimization in a real app */}
      <img 
      src="../static/past_issues.png" 
      alt="Link to Past Issues" 
      width="300" 
      height="400"
      />
      </a>
      </div>
      </div>
      
      {/* The fixed navigation bar */}
      <div className="navbar">
      <a href="#top">top of page</a>
      <a href="#news">News</a>
      <a href="#contact">Contact</a>
      </div>
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
  