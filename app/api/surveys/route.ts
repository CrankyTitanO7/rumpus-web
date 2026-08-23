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

// responses/<surveyId>.json shape:
// { "_total": 17,
//   "hours": { "2026-08-22T21": 5 },                      // UTC hour -> votes
//   "tally": { "<questionId>": { "<option text>": 9 } },  // quantitative counts
//   "texts": { "<questionId>": ["answer", "..."] } }      // free-text archive
interface StoredTally {
    _total: number;
    hours: Record<string, number>;
    tally: Record<string, Record<string, number>>;
    texts: Record<string, string[]>;
}

const SURVEYS_PATH = 'surveys.json';
const MAX_TEXTS_PER_QUESTION = 500;
const MAX_FILE_CHARS = 900_000;

function ghBase() {
    return process.env.GITHUB_API_BASE || 'https://api.github.com';
}

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
    const res = await fetch(`${ghBase()}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
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
    const res = await fetch(`${ghBase()}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
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
    if (
        value &&
        typeof value === 'object' &&
        Array.isArray((value as { surveys?: unknown }).surveys)
    ) {
        return (value as { surveys: SurveyDef[] }).surveys.filter(
            (s) => s && typeof s.id === 'string' && Array.isArray(s.questions)
        );
    }
    return [];
}

function emptyTally(): StoredTally {
    return { _total: 0, hours: {}, tally: {}, texts: {} };
}

function asStoredTally(value: unknown): StoredTally {
    const out = emptyTally();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
    const v = value as Record<string, unknown>;
    if (typeof v._total === 'number') out._total = v._total;
    if (v.hours && typeof v.hours === 'object' && !Array.isArray(v.hours)) {
        for (const [k, n] of Object.entries(v.hours as Record<string, unknown>)) {
            if (typeof n === 'number') out.hours[k] = n;
        }
    }
    if (v.tally && typeof v.tally === 'object' && !Array.isArray(v.tally)) {
        for (const [qid, opts] of Object.entries(v.tally as Record<string, unknown>)) {
            if (opts && typeof opts === 'object' && !Array.isArray(opts)) {
                const bucket: Record<string, number> = {};
                for (const [opt, n] of Object.entries(opts as Record<string, unknown>)) {
                    if (typeof n === 'number') bucket[opt] = n;
                }
                out.tally[qid] = bucket;
            }
        }
    }
    if (v.texts && typeof v.texts === 'object' && !Array.isArray(v.texts)) {
        for (const [qid, arr] of Object.entries(v.texts as Record<string, unknown>)) {
            if (Array.isArray(arr)) {
                out.texts[qid] = arr.filter((t): t is string => typeof t === 'string');
            }
        }
    }
    return out;
}

// map stored option-text keys back to "<questionId>:<index>" keys for the client
function toPublicResults(survey: SurveyDef, stored: StoredTally): Record<string, number> {
    const out: Record<string, number> = { _total: stored._total };
    for (const q of survey.questions) {
        if (q.type === 'text') continue;
        const byText = stored.tally[q.id] || {};
        q.options.forEach((optText, i) => {
            out[`${q.id}:${i}`] = byText[optText] || 0;
        });
    }
    return out;
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
                    const stored = asStoredTally(file?.content ?? null);
                    results[survey.id] = toPublicResults(survey, stored);
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

        const path = `responses/${surveyId}.json`;
        for (let attempt = 0; attempt < 3; attempt++) {
            const existing = await readFile(repo, token, path);
            const stored = asStoredTally(existing?.content ?? null);

            for (let qi = 0; qi < survey.questions.length; qi++) {
                const q = survey.questions[qi];
                const raw = (answers[qi] || {}) as Record<string, unknown>;
                const clampIndex = (n: unknown) =>
                    typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < q.options.length
                        ? n
                        : -1;

                if (q.type === 'text') {
                    const text = String(raw.text ?? '')
                        .trim()
                        .slice(0, 2000);
                    if (text) {
                        const list = stored.texts[q.id] || [];
                        if (list.length < MAX_TEXTS_PER_QUESTION) list.push(text);
                        stored.texts[q.id] = list;
                    }
                    continue;
                }

                const indices =
                    q.type === 'multi'
                        ? [
                              ...new Set(
                                  (Array.isArray(raw.multi) ? raw.multi : []).map(clampIndex)
                              ),
                          ].filter((n) => n >= 0)
                        : [clampIndex(raw.choice)].filter((n) => n >= 0);

                for (const i of indices) {
                    const optText = q.options[i];
                    const bucket = (stored.tally[q.id] ||= {});
                    bucket[optText] = (bucket[optText] || 0) + 1;
                }
            }

            stored._total += 1;
            const hourKey = new Date().toISOString().slice(0, 13);
            stored.hours[hourKey] = (stored.hours[hourKey] || 0) + 1;

            const serialized = JSON.stringify(stored, null, 2);
            if (serialized.length > MAX_FILE_CHARS) {
                throw new Error(`${path} exceeds safe storage size (${serialized.length} chars)`);
            }

            const status = await writeFile(
                repo,
                token,
                path,
                stored,
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
