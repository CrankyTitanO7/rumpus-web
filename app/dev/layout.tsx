import type { Metadata } from "next";
import "./dev.css";

// not linked anywhere on the site — keep it out of search engines too
export const metadata: Metadata = {
    title: "dev · the Yale Rumpus",
    robots: { index: false, follow: false },
};

// never bake an auth decision (or protected content) into the build output
export const dynamic = "force-dynamic";

export default function DevLayout({ children }: { children: React.ReactNode }) {
    return children;
}
