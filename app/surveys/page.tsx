"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import "./surveys.css";

type QuestionType = "single" | "multi" | "text";

interface SurveyQuestion {
    id: string;
    text: string;
    type: QuestionType;
    options: string[]; // empty for type "text"
}

interface Survey {
    id: string;
    title: string;
    blurb: string;
    closes: string;
    questions: SurveyQuestion[];
}

// surveyId -> { "${questionId}:${optionIndex}": count }
type Results = Record<string, Record<string, number>>;

const VOTED_KEY = "rumpus-surveys-voted";

const FALLBACK_SURVEYS: Survey[] = [
    {
        id: "spring-fling-2027",
        title: "Spring Fling 2027 headliner",
        blurb: "dream big. delusional picks encouraged.",
        closes: "2026-12-31",
        questions: [
            {
                id: "q1",
                text: "who should headline spring fling 2027?",
                type: "single",
                options: [
                    "zara larsson (again)",
                    "charli xcx",
                    "a band made entirely of TFs",
                    "the shubert theater organist",
                ],
            },
        ],
    },
    {
        id: "dining-halls",
        title: "dining hall supremacy",
        blurb: "settle this once and for all.",
        closes: "2026-12-31",
        questions: [
            {
                id: "q1",
                text: "which residential college has the best dining hall?",
                type: "single",
                options: ["berkeley", "silliman", "saybrook", "morse", "other (wrong answer)"],
            },
            {
                id: "q2",
                text: "what should the dining halls bring back? (pick any)",
                type: "multi",
                options: [
                    "chicken nugget day",
                    "soft serve machines",
                    "waffle fries",
                    "the panini press renaissance",
                ],
            },
            {
                id: "q3",
                text: "dining hall horror stories / confessions (anonymous)",
                type: "text",
                options: [],
            },
        ],
    },
];

function getVoted(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
        return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) || "[]"));
    } catch {
        return new Set();
    }
}

let votedSnapshot: Set<string> | null = null;

function subscribeVoted(cb: () => void) {
    window.addEventListener("rumpus-voted", cb);
    return () => window.removeEventListener("rumpus-voted", cb);
}

function getVotedSnapshot(): Set<string> {
    if (!votedSnapshot) votedSnapshot = getVoted();
    return votedSnapshot;
}

function markVoted(id: string) {
    const next = getVoted();
    next.add(id);
    localStorage.setItem(VOTED_KEY, JSON.stringify([...next]));
    votedSnapshot = next;
    window.dispatchEvent(new Event("rumpus-voted"));
}

function optionKey(questionId: string, index: number) {
    return `${questionId}:${index}`;
}

export default function SurveysPage() {
    const [surveys, setSurveys] = useState<Survey[]>(FALLBACK_SURVEYS);
    const [results, setResults] = useState<Results>({});
    const [live, setLive] = useState(false); // true if backend responded
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const voted = useSyncExternalStore(subscribeVoted, getVotedSnapshot, () => new Set<string>());
    const [answers, setAnswers] = useState<Record<string, number[]>>({});
    const [texts, setTexts] = useState<Record<string, string>>({});
    const [hp, setHp] = useState(""); // honeypot: humans never see this field
    const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/surveys");
                if (!res.ok) return;
                const data = await res.json();
                if (Array.isArray(data.surveys) && data.surveys.length > 0) {
                    setSurveys(data.surveys);
                    setResults(data.results || {});
                    setLive(true);
                }
            } catch {
                // no backend yet: stay on fallback data
            }
        })();
    }, []);

    const selected = surveys.find((s) => s.id === selectedId) || null;

    function tallyFor(surveyId: string) {
        const tally = results[surveyId] || {};
        const total =
            typeof tally._total === "number"
                ? tally._total
                : Object.entries(tally)
                      .filter(([k]) => k !== "_total")
                      .reduce((max, [, v]) => Math.max(max, v), 0);
        return { tally, total };
    }

    function toggleChoice(question: SurveyQuestion, index: number) {
        setAnswers((prev) => {
            const cur = prev[question.id] || [];
            if (question.type === "single") {
                return { ...prev, [question.id]: [index] };
            }
            const next = cur.includes(index)
                ? cur.filter((i) => i !== index)
                : [...cur, index];
            return { ...prev, [question.id]: next };
        });
    }

    async function submitSurvey(survey: Survey) {
        setStatus("sending");
        const payload = {
            surveyId: survey.id,
            hp,
            answers: survey.questions.map((q) => ({
                questionId: q.id,
                choice: q.type === "text" ? null : (answers[q.id] || [])[0] ?? -1,
                multi: q.type === "multi" ? answers[q.id] || [] : undefined,
                text: q.type === "text" ? texts[q.id]?.slice(0, 2000) : undefined,
            })),
        };
        try {
            await fetch("/api/surveys", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
        } catch {
            // still record locally so UX isn't blocked pre-backend
        }
        markVoted(survey.id);
        setStatus("done");

        // refresh tallies if backend is live
        if (live) {
            try {
                const res = await fetch("/api/surveys");
                const data = await res.json();
                setResults(data.results || {});
            } catch {}
        }
    }

    function renderBallot(survey: Survey) {
        const alreadyVoted = voted.has(survey.id);
        if (alreadyVoted || status === "done") {
            const { tally, total } = tallyFor(survey.id);
            return (
                <div className="results">
                    <h4>results {live ? "(live)" : "(totals coming soon)"}</h4>
                    {survey.questions
                        .filter((q) => q.type !== "text")
                        .map((q) => (
                            <div key={q.id} className="result-q">
                                <p className="result-q-text">{q.text}</p>
                                {q.options.map((opt, i) => {
                                    const count = tally[optionKey(q.id, i)] || 0;
                                    const pct =
                                        total > 0 ? Math.round((count / total) * 100) : 0;
                                    return (
                                        <div key={i} className="bar-row">
                                            <span className="bar-label">{opt}</span>
                                            <div className="bar">
                                                <div className="fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="bar-pct">{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    <button className="btn" onClick={() => setSelectedId(null)}>
                        back to all surveys
                    </button>
                </div>
            );
        }

        return (
            <form
                className="ballot"
                onSubmit={(e) => {
                    e.preventDefault();
                    submitSurvey(survey);
                }}
            >
                {survey.questions.map((q) => (
                    <fieldset key={q.id}>
                        <legend>{q.text}</legend>
                        {q.type === "text" ? (
                            <textarea
                                value={texts[q.id] || ""}
                                maxLength={2000}
                                placeholder="spill."
                                onChange={(e) =>
                                    setTexts((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                            />
                        ) : (
                            q.options.map((opt, i) => {
                                const checked = (answers[q.id] || []).includes(i);
                                return (
                                    <label
                                        key={i}
                                        className={`opt ${checked ? "selected" : ""}`}
                                    >
                                        <input
                                            type={q.type === "multi" ? "checkbox" : "radio"}
                                            name={`${survey.id}-${q.id}`}
                                            checked={checked}
                                            onChange={() => toggleChoice(q, i)}
                                        />
                                        {opt}
                                    </label>
                                );
                            })
                        )}
                    </fieldset>
                ))}
                <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hp-field"
                    value={hp}
                    onChange={(e) => setHp(e.target.value)}
                />
                <button className="btn" type="submit" disabled={status === "sending"}>
                    {status === "sending" ? "sending..." : "submit"}
                </button>
            </form>
        );
    }

    return (
        <main className="page">
            <header className="card hero">
                <h1>rumpus surveys</h1>
                <p>
                    the only news at Yale about stuff at Yale, now asking YOU about stuff at
                    Yale.
                </p>
                <Link href="/" className="home-link">
                    ← back home
                </Link>
            </header>

            {!selected && (
                <section className="survey-list">
                    {surveys.map((s) => (
                        <article key={s.id} className="card survey-card">
                            <div>
                                <h3>{s.title}</h3>
                                <p className="blurb">{s.blurb}</p>
                                <p className="meta">
                                    {voted.has(s.id) ? "you voted ✓ · " : ""}
                                    closes {s.closes} · {s.questions.length} question
                                    {s.questions.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                            <button className="btn" onClick={() => setSelectedId(s.id)}>
                                {voted.has(s.id) ? "view results" : "take survey"}
                            </button>
                        </article>
                    ))}
                </section>
            )}

            {selected && (
                <section className="card">
                    <h2>{selected.title}</h2>
                    <p className="blurb">{selected.blurb}</p>
                    {renderBallot(selected)}
                </section>
            )}
        </main>
    );
}
