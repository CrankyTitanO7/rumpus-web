// components/DynamicGameWrapper.tsx
"use client"; 

import dynamic from 'next/dynamic';

// 1. Import the actual Game component dynamically here, within the Client boundary.
const DynamicGame = dynamic(() => import('@/components/Game'), { ssr: false });

// 2. Define the wrapper component that renders the dynamically imported component.
export default function DynamicGameWrapper() {
  // You can optionally add a loading state here if your game loads slowly
  return <DynamicGame />;
}