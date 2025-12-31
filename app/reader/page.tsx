// large page viewer
import "../globals.css";
import { reverseTimer } from "@/lib/reverseTimer";

// current issue info
const reference = {
    issueurl: "https://online.fliphtml5.com/sesvj/zjfg/", // link to current article viewer
    pageref: [3], // page numbers for the three iframes
    targetdate: "2025-12-31T15:13:30", // target date for countdown timer
};

// queue up next issue info
const referenceNext = {
    issueurl: "https://online.fliphtml5.com/sesvj/iljc/", // link to next issue article viewer
    pageref: [3], // page numbers for the three iframes
    targetdate: reference.targetdate, // target date for countdown timer
    // dateform: new Date(reference.targetdate)
};

const timer = reverseTimer(new Date(reference.targetdate)); // check if target date has passed
const timeZero =
    timer.days === 0 &&
    timer.hours === 0 &&
    timer.minutes === 0 &&
    timer.seconds === 0;

// final reference object to use in the page
const endref = {
    issueurl: timeZero ? referenceNext.issueurl : reference.issueurl, // link to current article viewer
    pageref: timeZero ? referenceNext.pageref : reference.pageref, // page numbers for the three iframes
    targetdate: reference.targetdate, // target date for countdown timer
};

export default function reader() {
    return (
        <div className="bevel-wrap">
            <iframe
                src={`${endref.issueurl}#p=${endref.pageref[0]}`}
                height="1000px"
                width="1000px"
                style={{ border: "none" }}
            />
        </div>
    );
}
