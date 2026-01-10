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
                className="top blog-main"
                id="top"
            >
                <div className="frosted-card">
                    <h1
                        className="blog-title-main"
                    >
                        blog
                    </h1>
                    <p className="blog-intro">
                        Hello, and welcome to our blog! We are excited to share our
                        latest updates and insights with you. We will try to updates
                        you with new content on a regular basis, so please check
                        back often to see what's new. We hope you enjoy reading our
                        blog and find it informative and engaging.
                    </p>
                    <p className="blog-intro">
                        Feel free to leave your{" "}
                        <a
                            href="/about"
                        >
                            comments and feedback{" "}
                        </a>
                        on our website. We value your input and are always looking
                        for ways to improve our content. Thank you for visiting our
                        blog, and we look forward to seeing you again soon!
                    </p>
                </div>

                <div className="frosted-card">
                    <h2
                        className="git"
                        id="git"
                    >
                        Github Page
                    </h2>
                    <p className="github-desc">
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
                        className="github-card"
                    >
                        <img
                            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                            alt="GitHub Logo"
                        />
                        <div className="github-stats">
                            <div
                                className="repo-name"
                            >
                                yale-rumpus / rumpus-web
                            </div>
                            <div
                                className="repo-meta"
                            >
                                {repo
                                    ? `⭐ ${repo.stargazers_count} stars • Updated ${lastUpdated}`
                                    : "View repository on GitHub"}
                            </div>
                        </div>
                    </a>
                </div>

                <div className="frosted-card blog-section">
                    <h2
                        className="blog"
                        id="blog"
                    >
                        Official Blog Notes
                    </h2>
                    <div id="blog-content">
                        <div className="blog-casing">
                            <h3 className="blog-title">Blog 1/10/26</h3>
                            <br />
                            <p className="blog">
                                greetings rumpasauruses. After another bitchless showerless 5 hours of coding I bring you
                                yurdle.
                                yurdle is the wordle by Rumpus. every day the server picks one lucky lucky student to bestow the honor of
                                being the yurdle answer. We will display their full name graduation year and college.
                                this person has been chosen.
                                by yurdle rump-law we hereby declare their deepest darkest dirtiest sexual fantasies to be fulfilled.
                                bonus points if you send us pictures (they will be posted).
                                <br />
                                additional notes. there is NO repetition prevention. you may get chosen twice (you lucky perv).
                                ts is managed by the Y/CS yalies api. if there be something wrong (ie misspelling, not updating, randomly placed peach emoji
                                smack dab in the middle of your name)... it is hashtag not my problem. I will say on a real note it is a well managed project.
                                <br /> there are no easter eggs ! ! ! !
                                <br />- Coochie Clicker
                            </p>
                        </div>

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
