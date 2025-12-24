import { fetchCommits } from "./actions";
import CommitList from "./CommitList";
// import "./blogstyle.css";

export default async function Page() {
  const initialCommits = await fetchCommits(1);

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ color: '#000000ff', fontSize: '32px', borderTop: '1px solid #d0d7de' }}>blog</h1>    
        <p style={{ color: '#999999ff', fontSize: '15px'}}>Hello, and welcome to our blog! We are excited to share our latest updates and insights with you. We will try to updates
        you with new content on a regular basis, so please check back often to see what's new. We hope you enjoy reading our blog and find it informative and engaging.</p>
      <p style={{ color: '#999999ff', fontSize: '15px'}}>Feel free to leave your <a href="/feedback" style={{ textDecoration: 'underline', color: '#7283cfff' }}>comments and feedback </a>on our website. 
        We value your input and are always looking for ways to improve our content. 
        Thank you for visiting our blog, and we look forward to seeing you again soon!
        </p>
      <h2 style={{ color: '#000000ff', fontSize: '24px', borderTop: '1px solid #d0d7de', margin: '20px 0' }}>Recent Commits</h2>
      <CommitList initialCommits={initialCommits} />
    </main>
  );
}