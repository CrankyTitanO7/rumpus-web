import { fetchCommits } from "./actions";
import CommitList from "./CommitList";

export default async function Page() {
  const initialCommits = await fetchCommits(1);

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Recent Commits</h1>
      <CommitList initialCommits={initialCommits} />
    </main>
  );
}