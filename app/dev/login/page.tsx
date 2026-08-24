import DevLogin from "../DevLogin";

export default async function DevLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ next?: string }>;
}) {
    const { next } = await searchParams;
    return <DevLogin next={next || "/dev"} />;
}
