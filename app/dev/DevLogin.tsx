"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function DevLogin({ next = "/dev" }: { next?: string }) {
    const [error, formAction, pending] = useActionState(login, null);

    return (
        <div className="dev-gate">
            <form className="dev-login" action={formAction}>
                <h1>dev</h1>
                <p>restricted. enter the password.</p>
                <input type="hidden" name="next" value={next} />
                <input
                    type="password"
                    name="password"
                    autoFocus
                    autoComplete="current-password"
                    required
                />
                <button className="btn" disabled={pending}>
                    {pending ? "checking..." : "enter"}
                </button>
                {error && <p className="dev-error">{error}</p>}
            </form>
        </div>
    );
}
