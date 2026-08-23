import { fetchCommits, fetchRepoDetails } from "./actions";
import BlogSidebar from "./BlogSidebar";
import "./blogstyle.css";
import CommitList from "./CommitList"; // looks like an error but DON'T TOUCH IT it works fine.
import RefreshButton from "./RefreshButton"; // Small client component for the button

export default async function Page() {
    const initialCommits = await fetchCommits(1);
    const repo = await fetchRepoDetails();

    // Formatting the date for the card
    const lastUpdated = repo ? new Date(repo.updated_at).toLocaleDateString() : "Recently";

    return (
        <>
            <main className="top blog-main" id="top">
                <div className="frosted-card">
                    <h1 className="blog-title-main">blog</h1>
                    <p className="blog-intro">
                        Hello, and welcome to our blog! We are excited to share our latest updates and insights with
                        you. We will try to updates you with new content on a regular basis, so please check back often
                        to see what's new. We hope you enjoy reading our blog and find it informative and engaging.
                    </p>
                    <p className="blog-intro">
                        Feel free to leave your <a href="/about">comments and feedback </a>
                        on our website. We value your input and are always looking for ways to improve our content.
                        Thank you for visiting our blog, and we look forward to seeing you again soon!
                    </p>
                </div>

                <div className="frosted-card">
                    <h2 className="git" id="git">
                        Github Page
                    </h2>
                    <p className="github-desc">
                        Check out our GitHub page to see the latest updates and contributions from our team. We are
                        always working on new features and improvements, so be sure to follow us for the latest news and
                        developments.
                    </p>

                    {/* GitHub Preview Card with Dynamic Stats */}
                    <a
                        href="https://github.com/yale-rumpus/rumpus-web"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-card"
                    >
                        <img
                            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                            alt="GitHub Logo"
                        />
                        <div className="github-stats">
                            <div className="repo-name">yale-rumpus / rumpus-web</div>
                            <div className="repo-meta">
                                {repo
                                    ? `⭐ ${repo.stargazers_count} stars • Updated ${lastUpdated}`
                                    : "View repository on GitHub"}
                            </div>
                        </div>
                    </a>
                </div>

                <div className="frosted-card blog-section">
                    <h2 className="blog" id="blog">
                        Official Blog Notes
                    </h2>
                    <div id="blog-content">
                        <div className="blog-casing">
                            <h3 className="blog-title">bug fixes</h3>
                            <br />
                            <p className="blog">
                                No current bugs we're investigating.
                                <br />
                            </p>
                        </div>
                        <div className="blog-casing">
                            <h3 className="blog-title">future incoming features</h3>
                            <br />
                            <p className="blog">
                                no new features announced yet! check back in soon though, we're very spontaneous
                                <br />
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
                        id="commits"
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
