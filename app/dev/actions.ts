"use server";

import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEV_COOKIE, DEV_LOGIN_PATH, devToken } from "@/lib/devAuth";

function safeNext(raw: string): string {
    if (raw === DEV_LOGIN_PATH) return "/dev";
    if (raw === "/dev" || raw.startsWith("/dev/")) return raw;
    return "/dev";
}

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
    const expected = process.env.DEV_PASSWORD;
    if (!expected) {
        console.error("dev login attempted but DEV_PASSWORD is not set");
        return "wrong password.";
    }

    const password = String(formData.get("password") || "");
    const given = Buffer.from(password);
    const want = Buffer.from(expected);
    if (given.length !== want.length || !timingSafeEqual(given, want)) {
        return "wrong password.";
    }

    const next = safeNext(String(formData.get("next") || "/dev"));

    const store = await cookies();
    store.set(DEV_COOKIE, await devToken(expected), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
    });

    redirect(next);
}
