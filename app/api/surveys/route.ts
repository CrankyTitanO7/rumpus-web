import { NextResponse } from 'next/server';

interface SurveyQuestion {
    id: string;
    text: string;
    type: 'single' | 'multi' | 'text';
    options: string[];
}

interface SurveyDef {
    id: string;
    title: string;
    blurb?: string;
    closes?: string;
    questions: SurveyQuestion[];
}

interface StoredAnswer {
    questionId: string;
    choice: number | null;
    multi?: number[];
    text?: string;
}

interface StoredResponse {
    answers: StoredAnswer[];
    ts: number;
}

const GH_API = 'https://api.github.com';
const SURVEYS_PATH = 'surveys.json';

function getEnv() {
    const token = process.env.SURVEYS_GITHUB_TOKEN ?? process.env.VOTES_GITHUB_TOKEN;
    const repo = process.env.SURVEYS_REPO;
    if (!token || !repo || !/^[^/\s]+\/[^/\s]+$/.test(repo)) {
        throw new Error(
            'Set SURVEYS_REPO=<owner>/<repo> and SURVEYS_GITHUB_TOKEN (or VOTES_GITHUB_TOKEN)'
        );
    }
    return { token, repo };
}

function ghHeaders(token: string): HeadersInit {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
}

async function readFile(
    repo: string,
    token: string,
    path: string
): Promise<{ content: unknown; sha?: string } | null> {
    const res = await fetch(`${GH_API}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
        headers: ghHeaders(token),
        cache: 'no-store',
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub read failed for ${path} (${res.status})`);
    const json = await res.json();

    // Contents API returns empty content for 0-byte files and for files over 1MB
    if (!json.content || json.encoding === 'none') {
        if (json.size === 0) return { content: null, sha: json.sha };
        throw new Error(`${path} exceeds the 1MB Contents API limit (${json.size} bytes)`);
    }

    const raw = Buffer.from(json.content, 'base64').toString('utf8');
    if (raw.trim().length === 0) return { content: null, sha: json.sha };

    try {
        return { content: JSON.parse(raw), sha: json.sha };
    } catch {
        throw new Error(`${path} does not contain valid JSON`);
    }
}

async function writeFile(
    repo: string,
    token: string,
    path: string,
    data: unknown,
    sha: string | undefined,
    message: string
): Promise<number> {
    const res = await fetch(`${GH_API}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: { ...ghHeaders(token), 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
            message,
            content: Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64'),
            ...(sha ? { sha } : {}),
        }),
    });
    return res.status;
}

const RATE_WINDOW_MS = 10_000;
const RATE_MAX_HITS = 1;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
    const now = Date.now();
    const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
    hits.set(ip, recent);
    if (recent.length >= RATE_MAX_HITS) return true;
    recent.push(now);
    return false;
}

function asSurveys(value: unknown): SurveyDef[] {
    if (value && typeof value === 'object' && Array.isArray((value as { surveys?: unknown }).surveys)) {
        return (value as { surveys: SurveyDef[] }).surveys.filter(
            (s) => s && typeof s.id === 'string' && Array.isArray(s.questions)
        );
    }
    return [];
}

export async function GET() {
    try {
        const { token, repo } = getEnv();
        const defsFile = await readFile(repo, token, SURVEYS_PATH);
        const surveys = asSurveys(defsFile?.content);
        const results: Record<string, Record<string, number>> = {};

        await Promise.all(
            surveys.map(async (survey) => {
                try {
                    const file = await readFile(repo, token, `responses/${survey.id}.json`);
                    const list: StoredResponse[] = Array.isArray(file?.content)
                        ? (file!.content as StoredResponse[])
                        : [];
                    const tally: Record<string, number> = { _total: list.length };
                    for (const r of list) {
                        for (const a of r.answers || []) {
                            if (typeof a.choice === 'number' && a.choice >= 0) {
                                const key = `${a.questionId}:${a.choice}`;
                                tally[key] = (tally[key] || 0) + 1;
                            } else if (Array.isArray(a.multi)) {
                                for (const i of a.multi) {
                                    const key = `${a.questionId}:${i}`;
                                    tally[key] = (tally[key] || 0) + 1;
                                }
                            } else if (typeof a.text === 'string' && a.text.length > 0) {
                                const key = `${a.questionId}:__text`;
                                tally[key] = (tally[key] || 0) + 1;
                            }
                        }
                    }
                    results[survey.id] = tally;
                } catch (err) {
                    console.error(`surveys GET tally failed for ${survey.id}:`, err);
                }
            })
        );

        return NextResponse.json({ surveys, results });
    } catch (err) {
        console.error('surveys GET:', err);
        return NextResponse.json({ surveys: [], results: {} }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown';
        if (rateLimited(ip)) {
            return NextResponse.json({ error: 'slow down' }, { status: 429 });
        }

        const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'bad request' }, { status: 400 });
        }

        // honeypot field is invisible to humans; bots that fill it get a fake success
        if (typeof body.hp === 'string' && body.hp.length > 0) {
            return NextResponse.json({ success: true });
        }

        const surveyId = body.surveyId;
        const answers = body.answers;
        if (
            typeof surveyId !== 'string' ||
            !/^[a-z0-9-]{1,64}$/.test(surveyId) ||
            !Array.isArray(answers)
        ) {
            return NextResponse.json({ error: 'bad request' }, { status: 400 });
        }

        const { token, repo } = getEnv();

        const defsFile = await readFile(repo, token, SURVEYS_PATH);
        const survey = asSurveys(defsFile?.content).find((s) => s.id === surveyId);
        if (!survey) {
            return NextResponse.json({ error: 'unknown survey' }, { status: 400 });
        }
        if (answers.length !== survey.questions.length) {
            return NextResponse.json({ error: 'bad request' }, { status: 400 });
        }

        const clean: StoredAnswer[] = survey.questions.map((q, idx) => {
            const raw = (answers[idx] || {}) as Record<string, unknown>;
            const clampIndex = (n: unknown) =>
                typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < q.options.length
                    ? n
                    : -1;

            if (q.type === 'text') {
                return {
                    questionId: q.id,
                    choice: null,
                    text: String(raw.text ?? '')
                        .trim()
                        .slice(0, 2000),
                };
            }
            if (q.type === 'multi') {
                const multi = Array.isArray(raw.multi)
                    ? [...new Set((raw.multi as unknown[]).map(clampIndex).filter((n) => n >= 0))]
                    : [];
                return { questionId: q.id, choice: null, multi };
            }
            const choice = clampIndex(raw.choice);
            return { questionId: q.id, choice: choice >= 0 ? choice : null };
        });

        const path = `responses/${surveyId}.json`;
        for (let attempt = 0; attempt < 3; attempt++) {
            const existing = await readFile(repo, token, path);
            const list: StoredResponse[] =
                existing && Array.isArray(existing.content)
                    ? (existing.content as StoredResponse[])
                    : [];
            list.push({ answers: clean, ts: Date.now() });

            const status = await writeFile(
                repo,
                token,
                path,
                list,
                existing?.sha,
                `survey response: ${surveyId}`
            );
            if (status === 200 || status === 201) {
                return NextResponse.json({ success: true });
            }
            if (status !== 409 && status !== 422) {
                throw new Error(`GitHub write failed (${status})`);
            }
        }
        return NextResponse.json({ error: 'conflict, retry' }, { status: 503 });
    } catch (err) {
        console.error('surveys POST:', err);
        return NextResponse.json({ error: 'failed to save response' }, { status: 500 });
    }
}
