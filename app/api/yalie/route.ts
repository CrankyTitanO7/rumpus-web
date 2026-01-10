import { NextResponse } from 'next/server';

// In-memory cache for daily Yalie
let cachedYalie: { data: { fname: string; lname: string; year: number | string; profile: string; college: string }; date: string } | null = null;
let isFetching = false;
let fetchPromise: Promise<any> | null = null;

async function fetchNewYalie(): Promise<{ fname: string; lname: string; year: number | string; profile: string; college: string }> {
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
    const today = new Date().toDateString();

    // Check if we have a cached Yalie for today
    if (cachedYalie && cachedYalie.date === today) {
        return NextResponse.json(cachedYalie.data);
    }

    // Prevent multiple simultaneous fetches
    if (isFetching && fetchPromise) {
        return NextResponse.json(await fetchPromise);
    }

    isFetching = true;
    fetchPromise = fetchNewYalie()
        .then((data) => {
            cachedYalie = { data, date: today };
            isFetching = false;
            fetchPromise = null;
            return data;
        })
        .catch((error) => {
            isFetching = false;
            fetchPromise = null;
            throw error;
        });

    try {
        const data = await fetchPromise;
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching Yalie:', error);
        return NextResponse.json({ error: 'Failed to fetch Yalie' }, { status: 500 });
    }
}
