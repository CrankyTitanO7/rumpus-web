import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEV_COOKIE, DEV_LOGIN_PATH, isValidDevCookie } from "@/lib/devAuth";

// server-side enforcement for /dev pages — proxy.ts is the outer gate,
// this is the one that actually keeps protected content from rendering
export async function requireDevAccess(): Promise<void> {
    if (!(await isValidDevCookie((await cookies()).get(DEV_COOKIE)?.value))) {
        redirect(DEV_LOGIN_PATH);
    }
}
