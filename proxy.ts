import { NextRequest, NextResponse } from "next/server";
import { DEV_COOKIE, DEV_LOGIN_PATH, isValidDevCookie } from "@/lib/devAuth";

// /dev and every subpage are password-gated here, before any rendering
// happens — nothing under /dev is linked from the public site, so the
// only way in is knowing the URL and the password.
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (pathname === DEV_LOGIN_PATH) return NextResponse.next();

    if (!(await isValidDevCookie(request.cookies.get(DEV_COOKIE)?.value))) {
        const url = request.nextUrl.clone();
        url.pathname = DEV_LOGIN_PATH;
        url.search = "";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dev", "/dev/:path*"],
};
