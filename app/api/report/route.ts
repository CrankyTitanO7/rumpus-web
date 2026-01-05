import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, description } = await req.json();

        if (!description) {
            return NextResponse.json(
                { error: "Description required" },
                { status: 400 }
            );
        }

        const body = `
**Reporter:** ${name}
**Email:** ${email}

---

${description}
        `;

        const res = await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/issues`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github+json",
                },
                body: JSON.stringify({
                    title: `Bug report from ${name}`,
                    body,
                    labels: ["bug", "from-site"],
                }),
            }
        );

        if (!res.ok) {
            throw new Error(await res.text());
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed to create issue" },
            { status: 500 }
        );
    }
}
