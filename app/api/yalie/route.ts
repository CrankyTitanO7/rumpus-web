import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch("https://api.yalies.io/v2/people", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.YALIES_API_KEY}`,
      },
      body: JSON.stringify({
        query: "",
        filters: {},
        page: Math.floor(Math.random() * 50), // random page
        page_size: 50,
      }),
      cache: "no-store", // always fresh
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Yalie");
    }

    const json = await res.json();
    const people = json.data ?? json;

    const person = people[Math.floor(Math.random() * people.length)];

    return NextResponse.json({
      fname: person.first_name,
      lname: person.last_name,
      year: person.year,
      profile: person.profile,
      college: person.college,
    });
  } catch (error) {
    console.error('Error fetching Yalie:', error);
    return NextResponse.json({ error: 'Failed to fetch Yalie' }, { status: 500 });
  }
}