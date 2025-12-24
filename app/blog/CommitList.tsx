"use client";

import { useState, useEffect, useRef } from "react";
import { fetchCommits } from "./actions";

export default function CommitList({ initialCommits }: { initialCommits: any[] }) {
  const [commits, setCommits] = useState(initialCommits);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Ref for the element at the bottom of the list
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
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  return (
    <ul>
      {commits.map((c) => {
        // Split subject from body (description)
        const [subject, ...bodyParts] = c.commit.message.split("\n\n");
        const body = bodyParts.join("\n\n");

        return (
          <li key={c.sha} style={{ marginBottom: '24px', listStyle: 'none', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{subject}</div>
            <div style={{ color: '#555', fontSize: '0.9em' }}>
              <strong>{c.commit.author.name}</strong> committed on {new Date(c.commit.author.date).toLocaleDateString()}
            </div>
            
            {body && (
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f6f8fa', 
                padding: '10px', 
                borderRadius: '6px',
                marginTop: '8px',
                fontSize: '0.85em',
                fontFamily: 'inherit'
              }}>
                {body}
              </pre>
            )}
          </li>
        );
      })}

      {/* Sentinel element to trigger load */}
      <div ref={observerTarget} style={{ height: '20px', textAlign: 'center' }}>
        {loading && "Loading more commits..."}
        {!hasMore && "End of commit history reached."}
      </div>
    </ul>
  );
}