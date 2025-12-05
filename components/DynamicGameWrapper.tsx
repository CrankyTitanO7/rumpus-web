"use client";

import dynamic from "next/dynamic";

// Dynamically import both games
const DynamicGame = dynamic(() => import("@/components/JizzGame"), { ssr: false });
const DynamicGame1 = dynamic(() => import("@/components/AssGame"), { ssr: false });

export default function DynamicGameWrapper() {
  return (
    <>
      <DynamicGame />
      <DynamicGame1 />
    </>
  );
}
