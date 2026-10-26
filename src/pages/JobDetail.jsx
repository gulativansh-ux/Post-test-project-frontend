
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getJobDetail } from "../api/jobDetail.js";
import BrandLoader from "../common-component/BrandLoader.jsx";

function parseList(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed
      : value.split(",").map((item) => item.trim()).filter(Boolean);
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function Value({ value, kind = "extract", list = false }) {
  const items = list ? parseList(value) : [];

  if (
    value == null ||
    value === "" ||
    (list && items.length === 0)
  ) {
    return (
      <span className="empty-value">
        {kind === "form" ? "—" : "Not in transcript"}
      </span>
    );
  }

  if (list) {
    return (
      <div className="chip-row">
        {items.map((item, index) => (
          <span className="chip" key={`${item}-${index}`}>
            {item}
          </span>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
}

export default function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setJob(null);
    setError("");

    getJobDetail(jobId)
      .then((data) => setJob(data.job ?? data))
      .catch((err) => setError(err.message));
  }, [jobId]);

  const salary =
    job?.salary_min == null && job?.salary_max == null
      ? null
      : `${job.salary_min ?? ""}${
          job.salary_min != null && job.salary_max != null ? " – " : ""
        }${job.salary_max ?? ""}`;

  const experience =
    job?.years_of_experience_min == null &&
    job?.years_of_experience_max == null
      ? null
      : `${job.years_of_experience_min ?? ""}${
          job.years_of_experience_min != null &&
          job.years_of_experience_max != null
            ? " – "
            : ""
        }${job.years_of_experience_max ?? ""} years`;

  if (error) {
    return (
      <div className="page">
        <p className="banner error">{error}</p>
        <Link to="/jobs-screen" className="ghost-btn">
          Back to Jobs
        </Link>
      </div>
    );
  }

  if (!job) {
    return (
      <BrandLoader
        title="Loading job"
        subtitle="Opening job details…"
      />
    );
  }

  if (job.extraction_status === "processing") {
    return (
      <div className="page">
        <BrandLoader
          title="Extracting JD"
          subtitle="This job opens after extraction finishes."
        />
        <Link to="/jobs-screen" className="ghost-btn">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const fields = [
    ["Title", job.position_title, "form"],
    ["Client", job.client_name, "form"],
    ["Salary range", salary, "form"],
    ["Headcount", job.headcount, "form"],
    ["Years of experience", experience],
    ["Urgency", job.urgency, "form"],
    ["Search locations", job.search_location, "form", true],
    ["Required skills", job.required_skills, "extract", true],
    ["Languages", job.languages, "extract", true],
    ["Tech stacks", job.tech_stacks, "extract", true],
    ["Job tags", job.job_tags, "extract", true],
    ["Observations", job.observation, "form", false, true],
    ["Job description", job.jd_text, "extract", false, true],
  ];

  return (
    <div className="page">
      <section className="card">
        <div className="card-head">
          <div>
            <p className="eyebrow">Job detail</p>
            <h2>{job.position_title}</h2>
          </div>

          <Link to="/jobs-screen" className="ghost-btn">
            Back to Jobs
          </Link>
        </div>

        <p className={`extract-line ${job.extraction_status}`}>
          Extraction: {job.extraction_status || "unknown"}
          {job.extraction_error ? ` — ${job.extraction_error}` : ""}
        </p>

        <div className="detail-grid">
          {fields.map(
            ([label, value, kind = "extract", list = false, full = false]) => (
              <label
                className={full || list ? "full-field" : ""}
                key={label}
              >
                {label}
                <Value value={value} kind={kind} list={list} />
              </label>
            )
          )}
        </div>
      </section>
    </div>
  );
}
