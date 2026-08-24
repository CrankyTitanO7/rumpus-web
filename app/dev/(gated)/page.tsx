import Link from "next/link";
import { requireDevAccess } from "../gate";

export default async function DevPage() {
    await requireDevAccess();
    return (
        <main className="dev-shell-inner">
            <h1>dev</h1>
            <ul>
                <li>
                    <Link href="/dev/survey-results">survey results</Link>
                </li>
            </ul>
        </main>
    );
}
