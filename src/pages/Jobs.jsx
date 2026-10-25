import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrandLoader from "../common-component/BrandLoader";
import { getPendingJobRequest, fullFillJob, fetchJobs } from "../api/jobs";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatUrgency(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState("");
  // const [notice, setNotice] = useState("");
  // const [extractNotice, setExtractNotice] = useState(null);
  const [acting, setActing] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const [jobsData, pendingData] = await Promise.all([fetchJobs(), getPendingJobRequest()]);
    setJobs(jobsData);    
    setPending(pendingData[0]);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // useEffect(() => {
  //   if (!notice) return undefined;
  //   const timer = setTimeout(() => setNotice(""), 5000);
  //   return () => clearTimeout(timer);
  // }, [notice]);

  // useEffect(() => {
  //   if (!extractNotice) return undefined;
  //   const timer = setTimeout(() => setExtractNotice(null), 5000);
  //   return () => clearTimeout(timer);
  // }, [extractNotice]);

  // useEffect(() => {
  //   let cancelled = false;

  //   async function poll() {
  //     try {
  //       const data = await getNotifications();
  //       const unread = data.notifications.find((item) => !item.read);
  //       if (!unread || cancelled) return;
  //       setExtractNotice(unread);
  //       await markNotificationRead(unread.id);
  //       await load();
  //     } catch {
  //       // Keep the list usable if polling fails once.
  //     }
  //   }

  //   poll();
  //   const timer = setInterval(poll, 2500);
  //   return () => {
  //     cancelled = true;
  //     clearInterval(timer);
  //   };
  // }, []);

  async function handleAction(kind) {
    debugger
    if (!pending) return;
    setError("");
    // setNotice("");
    setActing(kind);
    try {
      if (kind === "accept") {
        const data = await fullFillJob(pending.id,true);
        // setNotice(data.message);
      } else {
        const data = await fullFillJob(pending.id,false);
        // setNotice(data.message);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActing("");
    }
  }

  // const filtered = jobs?.filter((job) => {
  //   const haystack = `${job.title} ${job.client_name} ${job.recruiter_name}`.toLowerCase();
  //   return haystack.includes(query.trim().toLowerCase());
  // });

  // console.log("--->filtered",filtered)

  return (
    <div className="page">
      {loading ? <BrandLoader title="Loading jobs" subtitle="Fetching the jobs list…" /> : null}
      {pending ? (
        <section className="request-banner">
          <div>
            <p className="eyebrow">Job request</p>
            <p className="request-banner-title">
              {pending.position_title}
              <span>{pending.client_name}</span>
              <span>Urgency {formatUrgency(pending.urgency)}</span>
            </p>
          </div>
          <div className="request-banner-actions">
            <button
              type="button"
              className="danger-btn"
              disabled={Boolean(acting)}
              onClick={() => handleAction("reject")}
            >
              {acting === "reject" ? "Rejecting..." : "Reject"}
            </button>
            <button
              type="button"
              className="primary"
              disabled={Boolean(acting)}
              onClick={() => handleAction("accept")}
            >
              {acting === "accept" ? "Accepting..." : "Accept"}
            </button>
          </div>
        </section>
      ) : null}

      {/* {error ? <p className="banner error">{error}</p> : null}
      {notice ? <p className="banner success">{notice}</p> : null}
      {extractNotice ? (
        <div
          className={`create-toast ${extractNotice.type === "extraction_failed" ? "failed" : ""}`}
          role="status"
        >
          <div>
            <strong>{extractNotice.title}</strong>
            <p>{extractNotice.body}</p>
          </div>
        </div>
      ) : null} */}

      <section className="card">
        <div className="jobs-head">
          <div>
            <p className="eyebrow">Openings</p>
            <h2>Jobs {jobs?.length ? <small>{jobs.length}</small> : null}</h2>
          </div>
          <input
            className="jobs-search"
            // value={query}
            // onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs..."
          />
        </div>

        <div className="table-wrap">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Status</th>
                <th>Created</th>
                <th>Recruiter</th>
                <th>Extraction</th>
              </tr>
            </thead>
            <tbody>
              {jobs?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    {jobs.length === 0
                      ? "No jobs yet. Accept a pending request to create one."
                      : "No jobs match that search."}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const ready = job.extraction_status !== "processing";
                  return (
                  <tr key={job.id} className={ready ? "" : "row-locked"}>
                    <td className="title-cell">
                      {ready ? (
                        <Link to={`/jobs/${job.id}`}>{job.position_title}</Link>
                      ) : (
                        <span title="Wait until extraction finishes">{job.position_title}</span>
                      )}
                    </td>
                    <td>{job.client_name}</td>
                    <td>
                      <span className={`status-pill ${job.status}`}>{job.status}</span>
                    </td>
                    <td>{formatDate(job.created_at)}</td>
                    <td>{job.recruiter_name || "—"}</td>
                    <td>
                      <span className={`status-pill ${job.extraction_status}`}>
                        {job.extraction_status}
                      </span>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}