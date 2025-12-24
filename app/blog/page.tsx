// fetches commit messages from the Github API and displays them on a webpage

async function getCommits() {
  const res = await fetch(
    "https://api.github.com/repos/CrankyTitanO7/rumpus-web/commits",
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
      // Cache for 1 hour on Vercel
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch commits");
  }

  return res.json();
}

export default async function Page() {
  const commits = await getCommits();

  return (
    <main>
      <h1>Recent Commits</h1>
      <ul>
        {commits.slice(0, 5).map((c: any) => {
          // Split the message: Index 0 is the subject, the rest is the body
          const [subject, ...bodyParts] = c.commit.message.split("\n\n");
          const body = bodyParts.join("\n\n");

          return (
            <li key={c.sha} style={{ marginBottom: '20px' }}>
              <strong>{c.commit.author.name}</strong>: {subject}
              
              {body && (
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em', color: '#666' }}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
