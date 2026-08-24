import { requireDevAccess } from "../gate";

export default async function GatedDevLayout({ children }: { children: React.ReactNode }) {
    await requireDevAccess();
    return <div className="dev-shell">{children}</div>;
}
