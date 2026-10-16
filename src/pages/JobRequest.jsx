import { useEffect, useState } from "react";
import BrandLoader from "../common-component/BrandLoader.jsx";
import ValidationError from "../common-component/ValidationError.jsx";
import Autocomplete from "../common-component/Autocomplete.jsx";
import { getSavedUser } from "../utility/index.js";
import { createJobRequest } from "../api/jobRequest.js";
import { getClients } from "../api/client.js";
import { getRecruiters } from "../api/recruiter.js";
import { BRAND } from "../utility/consts.js";

const initialState = {
  clients: [],
  recruiters: [],
  clientId: "",
  recruiterId: "",
  urgency: "medium",
  title: "",
  headcount: "",
  salaryMin: "",
  salaryMax: "",
  search_location: [],
  observation: "",
  transcript: "",
  errors: {},
  success: "",
  saving: false,
  loading: true,
  fileName: "",
};

export default function JobRequest() {
  const user = getSavedUser();
  const isSuperadmin = user?.role === "superadmin";

  const [state, setState] = useState(initialState);

  const updateState = (updates) => {
    setState((current) => ({ ...current, ...updates }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setState((current) => ({
      ...current,
      [name]: value,
      errors: { ...current.errors, [name]: "" },
    }));
  };

  const clearError = (name) => {
    setState((current) => ({
      ...current,
      errors: { ...current.errors, [name]: "" },
    }));
  };

  useEffect(() => {
    async function load() {
      try {
        const clients = await getClients();
        updateState({ clients });

        if (isSuperadmin) {
          const data = await getRecruiters();
          updateState({ recruiters: data.recruiters });
        }
      } catch (error) {
        updateState({
          errors: { form: error.message },
        });
      } finally {
        updateState({ loading: false });
      }
    }

    load();
  }, [isSuperadmin]);

  useEffect(() => {
    if (!state.success) return;

    const timer = setTimeout(() => {
      updateState({ success: "" });
    }, 5000);

    return () => clearTimeout(timer);
  }, [state.success]);

  const validate = () => {
    const errors = {};
    const {
      clientId,
      recruiterId,
      title,
      headcount,
      salaryMin,
      salaryMax,
      search_location,
      transcript,
    } = state;

    if (!clientId) errors.clientId = "Pick a company.";

    if (isSuperadmin && !recruiterId) {
      errors.recruiterId = "Pick a recruiter.";
    }

    if (!title.trim()) {
      errors.title = "Position title is required.";
    }

    if (headcount && Number(headcount) < 1) {
      errors.headcount = "Headcount must be at least 1.";
    }

    if (salaryMin && Number(salaryMin) < 0) {
      errors.salaryMin = "Salary min cannot be negative.";
    }

    if (salaryMax && Number(salaryMax) < 0) {
      errors.salaryMax = "Salary max cannot be negative.";
    }

    if (
      salaryMin &&
      salaryMax &&
      Number(salaryMax) < Number(salaryMin)
    ) {
      errors.salaryMax =
        "Salary max must be greater than salary min.";
    }

    if (!search_location.length) {
      errors.search_location = "Add at least one search location.";
    }

    if (!transcript.trim()) {
      errors.transcript = "Paste or upload the meeting transcript.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    updateState({ success: "" });

    const errors = validate();
    updateState({ errors });

    if (Object.keys(errors).length) return;

    updateState({ saving: true });

    try {
      const data = await createJobRequest({
        client_id: Number(state.clientId),
        position_title: state.title,
        urgency: state.urgency,
        headcount: state.headcount
          ? Number(state.headcount)
          : null,
        salary_min: state.salaryMin
          ? Number(state.salaryMin)
          : null,
        salary_max: state.salaryMax
          ? Number(state.salaryMax)
          : null,
        search_location: state.search_location,
        observation: state.observation || null,
        meeting_transcript: state.transcript,
        assigned_to: isSuperadmin
          ? Number(state.recruiterId)
          : null,
      });

      setState((current) => ({
        ...current,
        success:
          data.assigned_to_name ||
          "the recruiter",
        title: "",
        headcount: "",
        salaryMin: "",
        salaryMax: "",
        search_location: [],
        observation: "",
        transcript: "",
        recruiterId: "",
        fileName: "",
        errors: {},
      }));

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      updateState({
        errors: { form: error.message },
      });
    } finally {
      updateState({ saving: false });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const validExtension = /\.(txt|md|text)$/i.test(file.name);

    if (!validExtension) {
      updateState({
        errors: {
          ...state.errors,
          transcript: "Upload a .txt or .md file.",
        },
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setState((current) => ({
        ...current,
        transcript: String(reader.result || ""),
        fileName: file.name,
        errors: { ...current.errors, transcript: "" },
      }));
    };

    reader.onerror = () => {
      setState((current) => ({
        ...current,
        errors: {
          ...current.errors,
          transcript: "Could not read that file.",
        },
      }));
    };

    reader.readAsText(file);
  };

  const {
    clients,
    recruiters,
    clientId,
    recruiterId,
    urgency,
    title,
    headcount,
    salaryMin,
    salaryMax,
    search_location,
    observation,
    transcript,
    errors,
    success,
    saving,
    loading,
    fileName,
  } = state;

  return (
    <form className="page" onSubmit={handleSubmit} noValidate>
      {loading && (
        <BrandLoader
          title="Loading job request"
          subtitle="Getting companies and recruiters…"
        />
      )}

      {saving && (
        <BrandLoader
          title="Creating job request"
          subtitle="Saving your request…"
        />
      )}

      {success && (
        <div className="create-toast" role="status">
          <img src={BRAND} alt="" />
          <div>
            <strong>New job request created</strong>
            <p>Assigned to {success}.</p>
          </div>
        </div>
      )}

      {errors.form && <p className="banner error">{errors.form}</p>}

      <section className="card">
        <div className="card-head">
          <div>
            <p className="eyebrow">New request</p>
            <h2>Create a job request</h2>
            <p className="hint">
              This only queues the request. A job is created after
              Accept. Gemini runs after that.
            </p>
          </div>

          <button
            type="submit"
            className="primary"
            disabled={saving || loading || clients.length === 0}
          >
            {saving ? "Saving..." : "Generate Job Request"}
          </button>
        </div>

        {clients.length === 0 && !loading && (
          <p className="banner error">
            No companies are assigned to you, so you cannot submit.
          </p>
        )}

        <div className="grid">
          <label className={errors.clientId ? "field-invalid" : ""}>
            Company *
            <select
              name="clientId"
              value={clientId}
              onChange={handleChange}
            >
              <option value="">Select company</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <ValidationError message={errors.clientId} />
          </label>

          {isSuperadmin && (
            <label
              className={errors.recruiterId ? "field-invalid" : ""}
            >
              Recruiter *
              <select
                name="recruiterId"
                value={recruiterId}
                onChange={handleChange}
              >
                <option value="">Select recruiter</option>
                {recruiters.map((recruiter) => (
                  <option key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}
                  </option>
                ))}
              </select>
              <ValidationError message={errors.recruiterId} />
            </label>
          )}

          <label>
            Urgency
            <select
              name="urgency"
              value={urgency}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className={errors.title ? "field-invalid" : ""}>
            Position title *
            <input
              name="title"
              value={title}
              onChange={handleChange}
              placeholder="e.g. Senior QA Engineer"
            />
            <ValidationError message={errors.title} />
          </label>

          <label className={errors.headcount ? "field-invalid" : ""}>
            Headcount
            <input
              type="number"
              min="1"
              name="headcount"
              value={headcount}
              onChange={handleChange}
              placeholder="1"
            />
            <ValidationError message={errors.headcount} />
          </label>

          <label className={errors.salaryMin ? "field-invalid" : ""}>
            Salary min
            <input
              type="number"
              min="0"
              name="salaryMin"
              value={salaryMin}
              onChange={handleChange}
              placeholder="80000"
            />
            <ValidationError message={errors.salaryMin} />
          </label>

          <label className={errors.salaryMax ? "field-invalid" : ""}>
            Salary max
            <input
              type="number"
              min="0"
              name="salaryMax"
              value={salaryMax}
              onChange={handleChange}
              placeholder="120000"
            />
            <ValidationError message={errors.salaryMax} />
          </label>
        </div>

        <label
          className={`full-field ${
            errors.search_location ? "field-invalid" : ""
          }`}
        >
          Search locations *
          <Autocomplete
            value={search_location}
            onChange={(next) => {
              updateState({ search_location: next });
              clearError("search_location");
            }}
          />
          <ValidationError message={errors.location} />

          {!errors.search_location && (
            <span className="field-help">
              Type a country or city, then press Enter or click a
              suggestion.
            </span>
          )}
        </label>

        <label className="full-field">
          Observations
          <input
            name="observation"
            value={observation}
            onChange={handleChange}
            placeholder="Optional notes from the client call"
          />
        </label>
      </section>

      <section className="card">
        <div className="transcript-head">
          <div>
            <p className="eyebrow">Source</p>
            <h2>Meeting transcript *</h2>
            <p className="hint">
              Paste the conversation or upload a text file. Missing
              facts stay empty later.
            </p>
            {fileName && (
              <span className="file-name">Loaded: {fileName}</span>
            )}
          </div>

          <label className="upload-btn">
            Upload
            <input
              type="file"
              accept=".txt,.md,.text,text/plain"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <label className={errors.transcript ? "field-invalid" : ""}>
          <textarea
            name="transcript"
            rows={10}
            value={transcript}
            onChange={handleChange}
            placeholder="Paste the meeting transcript here..."
          />
          <ValidationError message={errors.transcript} />
        </label>
      </section>
    </form>
  );
}