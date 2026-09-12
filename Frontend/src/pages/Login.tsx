import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/useAuth";
import { register } from "../services/authService";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else if (user.role === "STAFF") {
        navigate("/staff");
      } else {
        navigate("/student");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedName = registerName.trim();
    const trimmedEmail = registerEmail.trim();

    if (!trimmedName || !trimmedEmail || !registerPassword || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (registerPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password: registerPassword,
      });
      setSuccessMessage("Account created! You can now sign in.");
      setEmail(trimmedEmail);
      setPassword("");
      setRegisterPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError(err.response.data?.detail || "An account with this email already exists.");
        } else if (err.response?.status === 422) {
          setError("Invalid registration details. Please check your inputs.");
        } else {
          setError("Registration failed. Please try again later.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="rx-login-wrapper">
      {/* Background ambient decorative shapes */}
      <div className="rx-login-bg-glow-1" aria-hidden="true" />
      <div className="rx-login-bg-glow-2" aria-hidden="true" />
      <div className="rx-login-grid-overlay" aria-hidden="true" />

      <main className="rx-login-container">
        {/* ============================================================
            LEFT COLUMN — Product & AI Workflow Presentation
            ============================================================ */}
        <section className="rx-hero-column" aria-labelledby="rx-hero-heading">
          {/* Top Status Badge */}
          <div className="rx-hero-badge" role="status" aria-live="polite">
            <span className="rx-hero-badge-dot" aria-hidden="true" />
            <span>AI-Powered • Active</span>
          </div>

          {/* Main Heading */}
          <h1 id="rx-hero-heading" className="rx-hero-title">
            Turn complaints into
            <span className="rx-hero-title-accent"> resolutions.</span>
          </h1>

          {/* Supporting Text */}
          <p className="rx-hero-subtitle">
            ResolveX is an AI-powered complaint management platform that classifies, routes, and tracks complaints from submission to resolution.
          </p>

          {/* Connected Building Blocks Workflow */}
          <div className="rx-flow-blocks" aria-label="ResolveX Process">
            <span className="rx-flow-block">Classify</span>
            <span className="rx-flow-arrow" aria-hidden="true">→</span>
            <span className="rx-flow-block">Route</span>
            <span className="rx-flow-arrow" aria-hidden="true">→</span>
            <span className="rx-flow-block">Resolve</span>
          </div>

          {/* 4 Compact Workflow Cards */}
          <div className="rx-workflow-cards" role="list" aria-label="Workflow Stages">
            {/* Step 1 */}
            <div className="rx-workflow-card" role="listitem">
              <div className="rx-card-main">
                <span className="rx-step-num" aria-hidden="true">1</span>
                <span className="rx-step-title">Complaint Submitted</span>
              </div>
              <span className="rx-status-badge rx-status-badge--student">Student</span>
            </div>

            {/* Step 2 */}
            <div className="rx-workflow-card" role="listitem">
              <div className="rx-card-main">
                <span className="rx-step-num" aria-hidden="true">2</span>
                <span className="rx-step-title">AI Analysis</span>
              </div>
              <span className="rx-status-badge rx-status-badge--gemini">Gemini AI</span>
            </div>

            {/* Step 3 */}
            <div className="rx-workflow-card" role="listitem">
              <div className="rx-card-main">
                <span className="rx-step-num" aria-hidden="true">3</span>
                <span className="rx-step-title">Smart Routing</span>
              </div>
              <span className="rx-status-badge rx-status-badge--admin">Admin</span>
            </div>

            {/* Step 4 */}
            <div className="rx-workflow-card" role="listitem">
              <div className="rx-card-main">
                <span className="rx-step-num" aria-hidden="true">4</span>
                <span className="rx-step-title">Resolved</span>
              </div>
              <span className="rx-status-badge rx-status-badge--done">Done</span>
            </div>
          </div>
        </section>

        {/* ============================================================
            RIGHT COLUMN — Authentication Card
            ============================================================ */}
        <section className="rx-auth-column" aria-label="Authentication">
          <div className="rx-auth-card">
            {/* Card Header with RX Brand */}
            <div className="rx-auth-header">
              <div className="rx-auth-logo-badge" aria-hidden="true">RX</div>
              <h2 className="rx-auth-brand-title">ResolveX</h2>
              <p className="rx-auth-subtitle">
                {mode === "login"
                  ? "Sign in to manage complaints"
                  : "Create your account to get started"}
              </p>
            </div>

            {/* Alerts */}
            {successMessage && (
              <div className="rx-auth-alert rx-auth-alert--success" role="status">
                <svg className="rx-alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="rx-auth-alert rx-auth-alert--error" role="alert">
                <svg className="rx-alert-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="rx-auth-form" noValidate>
                <div className="rx-form-group">
                  <label htmlFor="login-email" className="rx-form-label">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="rx-form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="rx-form-group">
                  <label htmlFor="login-password" className="rx-form-label">
                    Password
                  </label>
                  <div className="rx-password-wrapper">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      className="rx-form-input rx-form-input--password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="rx-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="rx-auth-submit"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span className="rx-btn-loading">
                      <span className="rx-spinner" aria-hidden="true" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="rx-auth-footer">
                  <span>Don&apos;t have an account?</span>{" "}
                  <button
                    type="button"
                    className="rx-link-btn"
                    onClick={() => switchMode("register")}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="rx-auth-form" noValidate>
                <div className="rx-form-group">
                  <label htmlFor="reg-name" className="rx-form-label">
                    Full Name <span className="rx-required-star" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    className="rx-form-input"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>

                <div className="rx-form-group">
                  <label htmlFor="reg-email" className="rx-form-label">
                    Email Address <span className="rx-required-star" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    className="rx-form-input"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="e.g. student@university.edu"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="rx-form-group">
                  <label htmlFor="reg-password" className="rx-form-label">
                    Password <span className="rx-required-star" aria-hidden="true">*</span>
                  </label>
                  <div className="rx-password-wrapper">
                    <input
                      id="reg-password"
                      type={showRegisterPassword ? "text" : "password"}
                      className="rx-form-input rx-form-input--password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="rx-password-toggle"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="rx-form-group">
                  <label htmlFor="reg-confirm" className="rx-form-label">
                    Confirm Password <span className="rx-required-star" aria-hidden="true">*</span>
                  </label>
                  <div className="rx-password-wrapper">
                    <input
                      id="reg-confirm"
                      type={showConfirmPassword ? "text" : "password"}
                      className="rx-form-input rx-form-input--password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="rx-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="rx-auth-submit"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span className="rx-btn-loading">
                      <span className="rx-spinner" aria-hidden="true" />
                      <span>Creating Account...</span>
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="rx-auth-footer">
                  <span>Already have an account?</span>{" "}
                  <button
                    type="button"
                    className="rx-link-btn"
                    onClick={() => switchMode("login")}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;