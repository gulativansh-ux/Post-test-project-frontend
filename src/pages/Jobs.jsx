import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrandLoader from "../common-component/BrandLoader";
import { getPendingJobRequest, fullFillJob, fetchJobs } from "../api/jobs";
import { useNotifications } from "../context/NotificationContext";

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
  const [acting, setActing] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { jobRefreshVersion } = useNotifications();

  async function load() {
    const [jobsData, pendingData] = await Promise.all([
      fetchJobs(),
      getPendingJobRequest(),
    ]);
    setJobs(jobsData);
    setPending(pendingData[0]);
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (jobRefreshVersion > 0) {
      load().catch((err) => setError(err.message));
    }
  }, [jobRefreshVersion]);

  async function handleAction(kind) {
    if (!pending) return;
    setError("");
    setActing(kind);
    try {
      if (kind === "accept") {
        await fullFillJob(pending.id, true);
      } else {
        await fullFillJob(pending.id, false);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActing("");
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();

    return (
      job.position_title?.toLowerCase().includes(query) ||
      job.client_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page">
      {loading ? (
        <BrandLoader title="Loading jobs" subtitle="Fetching the jobs list…" />
      ) : null}
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

      <section className="card">
        <div className="jobs-head">
          <div>
            <p className="eyebrow">Openings</p>
            <h2>Jobs {jobs?.length ? <small>{jobs.length}</small> : null}</h2>
          </div>
          <input
            className="jobs-search"
            placeholder="Search by title or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    {jobs.length === 0
                      ? "No jobs yet. Accept a pending request to create one."
                      : "No jobs match that search."}
                  </td>
                </tr>
              ) : (
                  filteredJobs.map((job) => {
                  const ready = job.extraction_status !== "processing";
                  return (
                    <tr key={job.id} className={ready ? "" : "row-locked"}>
                      <td className="title-cell">
                        {ready ? (
                          <Link to={`/jobs-detail/${job.id}`}>
                            {job.position_title}
                          </Link>
                        ) : (
                          <span title="Wait until extraction finishes">
                            {job.position_title}
                          </span>
                        )}
                      </td>
                      <td>{job.client_name}</td>
                      <td>
                        <span className={`status-pill ${job.status}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{formatDate(job.created_at)}</td>
                      <td>{job.recruiter_name || "—"}</td>
                      <td>
                        <span
                          className={`status-pill ${job.extraction_status}`}
                        >
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