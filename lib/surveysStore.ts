// Shared read-side access to the survey store (survey defs + response tallies),
// used by the public API route and the password-protected /dev pages.

export interface SurveyQuestion {
    id: string;
    text: string;
    type: 'single' | 'multi' | 'text';
    options: string[];
}

export interface SurveyDef {
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
export interface StoredTally {
    _total: number;
    hours: Record<string, number>;
    tally: Record<string, Record<string, number>>;
    texts: Record<string, string[]>;
}

export const SURVEYS_PATH = 'surveys.json';

export function ghBase() {
    return process.env.GITHUB_API_BASE || 'https://api.github.com';
}

export function getEnv() {
    const token = process.env.SURVEYS_GITHUB_TOKEN ?? process.env.VOTES_GITHUB_TOKEN;
    const repo = process.env.SURVEYS_REPO;
    if (!token || !repo || !/^[^/\s]+\/[^/\s]+$/.test(repo)) {
        throw new Error(
            'Set SURVEYS_REPO=<owner>/<repo> and SURVEYS_GITHUB_TOKEN (or VOTES_GITHUB_TOKEN)'
        );
    }
    return { token, repo };
}

export function ghHeaders(token: string): HeadersInit {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
}

export async function readFile(
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

export function asSurveys(value: unknown): SurveyDef[] {
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

export function emptyTally(): StoredTally {
    return { _total: 0, hours: {}, tally: {}, texts: {} };
}

export function asStoredTally(value: unknown): StoredTally {
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

// full (non-public) results for the /dev pages: includes text answers + raw tallies
export interface FullSurveyResults {
    live: boolean;
    surveys: SurveyDef[];
    tallies: Record<string, StoredTally>;
}

export async function loadFullResults(): Promise<FullSurveyResults> {
    const { token, repo } = getEnv();
    const defsFile = await readFile(repo, token, SURVEYS_PATH);
    const surveys = asSurveys(defsFile?.content);
    const tallies: Record<string, StoredTally> = {};

    await Promise.all(
        surveys.map(async (survey) => {
            try {
                const file = await readFile(repo, token, `responses/${survey.id}.json`);
                tallies[survey.id] = asStoredTally(file?.content ?? null);
            } catch (err) {
                console.error(`survey store read failed for ${survey.id}:`, err);
            }
        })
    );

    return { live: true, surveys, tallies };
}
