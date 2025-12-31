"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function RefreshButton() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    return (
        <button
            onClick={handleRefresh}
            disabled={isPending}
            style={{
                backgroundColor: "transparent",
                border: "1px solid #d0d7de",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "13px",
                cursor: isPending ? "not-allowed" : "pointer",
                color: "#7283cfff",
                opacity: isPending ? 0.5 : 1,
            }}
        >
            {isPending ? "Refreshing..." : "Refresh"}
        </button>
    );
}
