"use client";

import { useState, useEffect, useRef } from "react";
import { fetchCommits } from "./actions";

// Helper to format date as "X time ago"
function formatRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString(); // Fallback to date for old commits
}

export default function CommitList({ initialCommits }: { initialCommits: any[] }) {
  const [commits, setCommits] = useState(initialCommits);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true);
          const nextPage = page + 1;
          const newCommits = await fetchCommits(nextPage);
          
          if (newCommits.length === 0) {
            setHasMore(false);
          } else {
            setCommits((prev) => [...prev, ...newCommits]);
            setPage(nextPage);
          }
          setLoading(false);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  return (
    <ul style={{ padding: 0 }}>
      {commits.map((c) => {
        const [subject, ...bodyParts] = c.commit.message.split("\n\n");
        const body = bodyParts.join("\n\n");

        return (
          <li key={c.sha} style={{ 
            marginBottom: '16px', 
            listStyle: 'none', 
            border: '1px solid #d0d7de', 
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            {/* Header / Subject */}
            <div style={{ padding: '12px', backgroundColor: '#f6f8fa9a', borderBottom: '1px solid #d0d7de' }}>
              <div style={{ fontWeight: '600', color: '#1f2328' }}>{subject}</div>
            </div>

            {/* Meta Data */}
            <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85em' }}>
              {c.author?.avatar_url && (
                <img 
                  src={c.author.avatar_url} 
                  alt={c.commit.author.name} 
                  style={{ width: '20px', height: '20px', borderRadius: '50%' }} 
                />
              )}
              <strong>{c.commit.author.name}</strong>
              <span style={{ color: '#8a9eb4ff' }}>
                committed {formatRelativeTime(c.commit.author.date)}
              </span>
              <code style={{ marginLeft: 'auto', backgroundColor: '#eff1f3ce', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }}>
                {c.sha.substring(0, 7)}
              </code>
            </div>
            
            {/* Description Body */}
            {body && (
              <div style={{ padding: '0 12px 12px 12px' }}>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  color: '#636c76',
                  marginTop: '4px',
                  fontSize: '0.85em',
                  fontFamily: 'inherit',
                  borderLeft: '2px solid #d0d7de',
                  paddingLeft: '10px'
                }}>
                  {body}
                </pre>
              </div>
            )}
          </li>
        );
      })}

      <div ref={observerTarget} style={{ padding: '20px', textAlign: 'center', color: '#8a9eb4ff', fontWeight: '600' }}>
        {loading && "Fetching more commits..."}
        {!hasMore && "You've reached the beginning of time (for this repo)."}
      </div>
    </ul>
  );
}