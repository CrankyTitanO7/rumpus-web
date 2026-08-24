import { loadFullResults, type StoredTally, type SurveyDef } from "@/lib/surveysStore";
import { requireDevAccess } from "../../gate";

export const dynamic = "force-dynamic";

function QuestionResults({
    survey,
    qid,
    stored,
}: {
    survey: SurveyDef;
    qid: string;
    stored: StoredTally;
}) {
    const question = survey.questions.find((q) => q.id === qid);
    if (!question) return null;
    const total = stored._total;

    if (question.type === "text") {
        const texts = stored.texts[qid] || [];
        return (
            <div className="dev-q">
                <p className="dev-q-text">{question.text}</p>
                <p className="dev-q-meta">
                    text answers ({texts.length})
                </p>
                {texts.length === 0 ? (
                    <p className="dev-empty">none yet</p>
                ) : (
                    <ul className="dev-texts">
                        {texts.map((t, i) => (
                            <li key={i}>{t}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    const byText = stored.tally[qid] || {};
    return (
        <div className="dev-q">
            <p className="dev-q-text">{question.text}</p>
            <p className="dev-q-meta">{question.type === "multi" ? "pick any · " : ""}% of {total} respondents</p>
            <div className="dev-bars">
                {question.options.map((opt, i) => {
                    const count = byText[opt] || 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                        <div key={i} className="dev-bar-row">
                            <span className="dev-bar-label">{opt}</span>
                            <div className="dev-bar">
                                <div className="dev-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="dev-bar-count">
                                {count} · {pct}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SurveyResults({ survey, stored }: { survey: SurveyDef; stored: StoredTally }) {
    const hours = Object.entries(stored.hours).sort(([a], [b]) => a.localeCompare(b));
    return (
        <section className="dev-survey">
            <h2>{survey.title}</h2>
            {survey.blurb && <p className="dev-blurb">{survey.blurb}</p>}
            <p className="dev-meta">
                id: {survey.id} · closes: {survey.closes || "n/a"} · {stored._total} total
                response{stored._total === 1 ? "" : "s"}
            </p>

            {stored._total === 0 && <p className="dev-empty">no responses yet</p>}

            {survey.questions.map((q) => (
                <QuestionResults key={q.id} survey={survey} qid={q.id} stored={stored} />
            ))}

            {hours.length > 0 && (
                <details className="dev-hours">
                    <summary>responses by hour (utc)</summary>
                    <ul>
                        {hours.map(([hour, count]) => (
                            <li key={hour}>
                                {hour}: {count}
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </section>
    );
}

export default async function SurveyResultsPage() {
    await requireDevAccess();

    let payload: Awaited<ReturnType<typeof loadFullResults>> | null = null;
    let error: string | null = null;

    try {
        payload = await loadFullResults();
    } catch (err) {
        console.error("dev survey-results:", err);
        error = err instanceof Error ? err.message : "unknown error";
    }

    return (
        <main className="dev-shell-inner">
            <h1>survey results</h1>

            {error && (
                <p className="dev-error">
                    couldn&apos;t load results: {error}
                </p>
            )}

            {payload && payload.surveys.length === 0 && <p className="dev-empty">no surveys defined</p>}

            {payload?.surveys.map((survey) => (
                <SurveyResults key={survey.id} survey={survey} stored={payload!.tallies[survey.id] ?? {
                    _total: 0,
                    hours: {},
                    tally: {},
                    texts: {},
                }} />
            ))}
        </main>
    );
}
