import { NextResponse } from 'next/server';
import {
    asStoredTally,
    asSurveys,
    getEnv,
    ghHeaders,
    ghBase,
    readFile,
    SURVEYS_PATH,
    type StoredTally,
    type SurveyDef,
} from '@/lib/surveysStore';

const MAX_TEXTS_PER_QUESTION = 500;
const MAX_FILE_CHARS = 900_000;

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
