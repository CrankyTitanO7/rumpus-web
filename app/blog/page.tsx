import { fetchCommits, fetchRepoDetails } from "./actions";
import BlogSidebar from "./BlogSidebar";
import "./blogstyle.css";
import CommitList from "./CommitList"; // looks like an error but DON'T TOUCH IT it works fine.
import RefreshButton from "./RefreshButton"; // Small client component for the button

export default async function Page() {
    const initialCommits = await fetchCommits(1);
    const repo = await fetchRepoDetails();

    // Formatting the date for the card
    const lastUpdated = repo
        ? new Date(repo.updated_at).toLocaleDateString()
        : "Recently";

    return (
        <>
            <main
                style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}
                className="top blog-main"
            >
                <h1
                    style={{
                        // color: "#ffffffff",
                        fontSize: "32px",
                        borderTop: "1px solid #d0d7de",
                    }}
                >
                    blog
                </h1>
                <p style={{ color: "#999999ff", fontSize: "15px" }}>
                    Hello, and welcome to our blog! We are excited to share our
                    latest updates and insights with you. We will try to updates
                    you with new content on a regular basis, so please check
                    back often to see what's new. We hope you enjoy reading our
                    blog and find it informative and engaging.
                </p>
                <p style={{ color: "#999999ff", fontSize: "15px" }}>
                    Feel free to leave your{" "}
                    <a
                        href="/about"
                        style={{
                            textDecoration: "underline",
                            color: "#7283cfff",
                        }}
                    >
                        comments and feedback{" "}
                    </a>
                    on our website. We value your input and are always looking
                    for ways to improve our content. Thank you for visiting our
                    blog, and we look forward to seeing you again soon!
                </p>
                <h2
                    style={{
                        // color: "#ffffffff",
                        fontSize: "24px",
                        borderTop: "1px solid #d0d7de",
                        margin: "20px 0",
                    }}
                    className="git"
                >
                    Github Page
                </h2>
                <p style={{ color: "#999999ff", fontSize: "15px" }}>
                    Check out our GitHub page to see the latest updates and
                    contributions from our team. We are always working on new
                    features and improvements, so be sure to follow us for the
                    latest news and developments.
                </p>

                {/* GitHub Preview Card with Dynamic Stats */}
                <a
                    href="https://github.com/yale-rumpus/rumpus-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px",
                        border: "1px solid #d0d7de",
                        borderRadius: "6px",
                        textDecoration: "none",
                        marginBottom: "20px",
                        backgroundColor: "#000000ff",
                    }}
                >
                    <img
                        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                        alt="GitHub Logo"
                        style={{
                            width: "40px",
                            height: "40px",
                            marginRight: "15px",
                            filter: "invert(1)",
                        }}
                    />
                    <div style={{ flexGrow: 1 }}>
                        <div
                            style={{
                                color: "#7283cfff",
                                fontWeight: "bold",
                                fontSize: "16px",
                            }}
                        >
                            yale-rumpus / rumpus-web
                        </div>
                        <div
                            style={{
                                color: "#999999ff",
                                fontSize: "13px",
                                marginTop: "4px",
                            }}
                        >
                            {repo
                                ? `⭐ ${repo.stargazers_count} stars • Updated ${lastUpdated}`
                                : "View repository on GitHub"}
                        </div>
                    </div>
                </a>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #d0d7de",
                        margin: "20px 0",
                    }}
                >
                    <h2
                        style={{
                            color: "#rgba(173, 173, 173, 1)",
                            fontSize: "24px",
                            margin: 0,
                        }}
                        className="blog"
                    >
                        Official Blog Notes
                    </h2>
                    <div id="blog-content">
                        <div className="blog-casing">
                            <h3 className="blog-title">Blog 12/30/25</h3>
                            <br />
                            <p className="blog">
                                Well-cum to my awesome blog.
                                <br />- Coochie Clicker
                            </p>
                        </div>

                        <div className="blog-casing">
                            <h3 className="blog-title">Blog 12/24/25</h3>
                            <br />
                            <p className="blog">
                                Merry Christmas! We are excited to announce the
                                launch of our new website for the Yale Rumpus.
                                Our team has been working hard to create a
                                platform that showcases our passion and drive
                                and dedication to the bit. we will keep working
                                on this project and keep you updated with new
                                features and content. Thank you for your
                                support, and we look forward to sharing our
                                journey with you!
                                <br />- Coochie Clicker
                            </p>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #d0d7de",
                        margin: "20px 0",
                    }}
                >
                    <h2
                        style={{
                            // color: "#000000ff",
                            fontSize: "24px",
                            margin: 0,
                        }}
                        className="commits"
                    >
                        Recent Commits
                    </h2>
                    <span>note that sometimes its a little slow to load.</span>
                    <RefreshButton />
                </div>

                <CommitList initialCommits={initialCommits} />
            </main>
            <BlogSidebar />
        </>
    );
}
