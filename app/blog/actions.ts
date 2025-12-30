"use server";

export async function fetchCommits(page: number = 1) {
    const res = await fetch(
        `https://api.github.com/repos/CrankyTitanO7/rumpus-web/commits?per_page=10&page=${page}`,
        {
            headers: {
                Accept: "application/vnd.github+json",
                // Optional: Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
            },
            next: { revalidate: 3600 },
        }
    );

    if (!res.ok) return [];
    return res.json();
}

export async function fetchRepoDetails() {
    const res = await fetch(
        "https://api.github.com/repos/CrankyTitanO7/rumpus-web",
        {
            headers: { Accept: "application/vnd.github+json" },
            next: { revalidate: 3600 },
        }
    );

    if (!res.ok) return null;
    return res.json();
}
