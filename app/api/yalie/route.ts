import { NextResponse } from 'next/server';

// Global cache for daily Yalie - persists across serverless function invocations
let dailyCache: { yalie: any; date: string } | null = null;
let isFetching = false;
let fetchPromise: Promise<any> | null = null;

function getTodayString(): string {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

async function fetchNewYalie(): Promise<any> {
    const res = await fetch("https://api.yalies.io/v2/people", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.YALIES_API_KEY}`,
        },
        body: JSON.stringify({
            query: "",
            filters: {},
            page: Math.floor(Math.random() * 50),
            page_size: 50,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch Yalie");
    }

    const json = await res.json();
    const people = json.data ?? json;
    const person = people[Math.floor(Math.random() * people.length)];

    return {
        fname: person.first_name,
        lname: person.last_name,
        year: person.year,
        profile: person.profile,
        college: person.college,
    };
}

export async function GET() {
    const today = getTodayString();

    // Return cached result if available for today
    if (dailyCache && dailyCache.date === today) {
        return NextResponse.json(dailyCache.yalie);
    }

    // Prevent race conditions with multiple simultaneous requests
    if (isFetching && fetchPromise) {
        try {
            const result = await fetchPromise;
            return NextResponse.json(result);
        } catch (error) {
            // If the promise failed, try to fetch fresh
            console.error('Cached fetch failed, fetching fresh:', error);
        }
    }

    isFetching = true;
    fetchPromise = fetchNewYalie()
        .then((yalie) => {
            // Cache the result
            dailyCache = { yalie, date: today };
            return yalie;
        })
        .catch((error) => {
            console.error('Error fetching Yalie:', error);
            throw error;
        })
        .finally(() => {
            isFetching = false;
            fetchPromise = null;
        });

    try {
        const yalie = await fetchPromise;
        return NextResponse.json(yalie);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch Yalie' }, { status: 500 });
    }
}
