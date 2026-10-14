
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/login";
import ValidationError from "../common-component/ValidationError";
import { EMAIL_PATTERN, BRAND } from "../utility/consts";

export default function Login() {
  const navigate = useNavigate();

  const [state, setState] = useState({
    email: "",
    password: "",
    errors: {},
    saving: false,
  });

  const { email, password, errors, saving } = state;

  function clearError(name) {
    setState((current) => ({
      ...current,
      errors: {
        ...current.errors,
        [name]: "",
      },
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const next = {};

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }

    setState((current) => ({
      ...current,
      errors: next,
    }));

    if (Object.keys(next).length) return;

    setState((current) => ({
      ...current,
      saving: true,
    }));

    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/requests/new");
    } catch (err) {
      setState((current) => ({
        ...current,
        errors: {
          ...current.errors,
          password: err.message || "Invalid email or password.",
        },
      }));
    } finally {
      setState((current) => ({
        ...current,
        saving: false,
      }));
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <img className="logo-mark" src={BRAND} alt="Pulso" />
          <h1>Pulso</h1>
          <p>
            Internal recruiting workspace for job requests and hiring teams.
          </p>
        </div>

        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div className="login-card-head">
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in to continue</h2>
          </div>

          <label className={errors.email ? "field-invalid" : ""}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setState((current) => ({
                  ...current,
                  email: e.target.value,
                  errors: {
                    ...current.errors,
                    email: "",
                  },
                }));
              }}
              placeholder="you@thinksys.com"
            />
            <ValidationError message={errors.email} />
          </label>

          <label className={errors.password ? "field-invalid" : ""}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setState((current) => ({
                  ...current,
                  password: e.target.value,
                  errors: {
                    ...current.errors,
                    password: "",
                  },
                }));
              }}
              placeholder="Enter your password"
            />
            <ValidationError message={errors.password} />
          </label>

          <button
            type="submit"
            className="primary full"
            disabled={saving}
          >
            {saving ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}