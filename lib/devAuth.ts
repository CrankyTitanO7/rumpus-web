// Shared helpers for the password-protected /dev area.
// Uses Web Crypto (crypto.subtle) so the same code runs in middleware,
// server components, and server actions.

export const DEV_COOKIE = "rumpus_dev";
export const DEV_LOGIN_PATH = "/dev/login";

// derive the cookie value from DEV_PASSWORD so rotating the password
// invalidates existing sessions without storing the password itself
export async function devToken(password: string): Promise<string> {
    const data = new TextEncoder().encode(`rumpus-dev:${password}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function isValidDevCookie(value: string | undefined): Promise<boolean> {
    const password = process.env.DEV_PASSWORD;
    if (!password || !value) return false;
    const expected = await devToken(password);
    if (value.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
        diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
}
