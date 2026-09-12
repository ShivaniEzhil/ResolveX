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

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      {/* Ambient Background Elements */}
      <div className="rx-login-bg-glow-1" aria-hidden="true" />
      <div className="rx-login-bg-glow-2" aria-hidden="true" />
      <div className="rx-login-grid-overlay" aria-hidden="true" />

      <div className="rx-login-container">
        {/* ============================================================
            LEFT COLUMN — Hero & Building Blocks Pipeline
            ============================================================ */}
        <div className="rx-hero-column">
          {/* Live Status Badge */}
          <div className="rx-hero-badge" role="status" aria-live="polite">
            <span className="rx-hero-badge-dot" aria-hidden="true" />
            AI-Powered · Active
          </div>

          {/* Main Headline */}
          <h1 className="rx-hero-title">
            Turn complaints{" "}
            <span className="rx-hero-gradient-text">into resolutions.</span>
          </h1>

          {/* Subtitle */}
          <p className="rx-hero-subtitle">
            ResolveX is an AI-powered complaint management platform that automatically
            classifies, routes, and tracks every grievance from submission to resolution.
          </p>

          {/* Key Value Props */}
          <div className="rx-phrase-container" aria-label="Key capabilities">
            <span className="rx-phrase-pill">Classify</span>
            <span aria-hidden="true">→</span>
            <span className="rx-phrase-pill">Route</span>
            <span aria-hidden="true">→</span>
            <span className="rx-phrase-pill">Resolve</span>
          </div>

          {/* Building Block Pipeline */}
          <div className="rx-pipeline-flow" role="list" aria-label="Complaint lifecycle">
            {/* Step 1: Submit */}
            <div className="rx-block-card" role="listitem">
              <div className="rx-block-left">
                <div className="rx-block-icon rx-block-icon--submit" aria-hidden="true">
                  ✦
                </div>
                <div className="rx-block-content">
                  <span className="rx-block-step">Step 1</span>
                  <span className="rx-block-title">Complaint Submit</span>
                  <span className="rx-block-desc">Student submits grievance with optional evidence</span>
                </div>
              </div>
              <span className="rx-block-tag">Student</span>
            </div>

            {/* Connector */}
            <div className="rx-flow-connector" aria-hidden="true">
              <div className="rx-flow-line" />
            </div>

            {/* Step 2: AI Analysis */}
            <div className="rx-block-card" role="listitem">
              <div className="rx-block-left">
                <div className="rx-block-icon rx-block-icon--ai" aria-hidden="true">
                  ✦
                </div>
                <div className="rx-block-content">
                  <span className="rx-block-step">Step 2</span>
                  <span className="rx-block-title">AI Analysis</span>
                  <span className="rx-block-desc">Gemini AI classifies category, priority & department</span>
                </div>
              </div>
              <span className="rx-block-tag rx-block-tag--ai">Gemini AI</span>
            </div>

            {/* Connector */}
            <div className="rx-flow-connector" aria-hidden="true">
              <div className="rx-flow-line" />
            </div>

            {/* Step 3: Routing */}
            <div className="rx-block-card" role="listitem">
              <div className="rx-block-left">
                <div className="rx-block-icon rx-block-icon--route" aria-hidden="true">
                  ✦
                </div>
                <div className="rx-block-content">
                  <span className="rx-block-step">Step 3</span>
                  <span className="rx-block-title">Smart Routing</span>
                  <span className="rx-block-desc">Auto-assigned to the best available staff member</span>
                </div>
              </div>
              <span className="rx-block-tag">Admin</span>
            </div>

            {/* Connector */}
            <div className="rx-flow-connector" aria-hidden="true">
              <div className="rx-flow-line" />
            </div>

            {/* Step 4: Resolved */}
            <div className="rx-block-card" role="listitem">
              <div className="rx-block-left">
                <div className="rx-block-icon rx-block-icon--resolve" aria-hidden="true">
                  ✦
                </div>
                <div className="rx-block-content">
                  <span className="rx-block-step">Step 4</span>
                  <span className="rx-block-title">Resolved</span>
                  <span className="rx-block-desc">Staff resolves and student is notified instantly</span>
                </div>
              </div>
              <span className="rx-block-tag rx-block-tag--success">✓ Done</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            RIGHT COLUMN — Auth Card
            ============================================================ */}
        <div className="rx-auth-column">
          <div className="rx-auth-card">
            {/* Card Header */}
            <div className="rx-auth-header">
              <div className="rx-auth-logo-badge" aria-hidden="true">RX</div>
              <h1>ResolveX</h1>
              <p className="rx-auth-subtitle">
                {mode === "login"
                  ? "Sign in to manage your complaints"
                  : "Create your student account"}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="rx-auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                id="tab-signin"
                aria-selected={mode === "login"}
                aria-controls="panel-signin"
                className={`rx-auth-tab ${mode === "login" ? "rx-auth-tab--active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                id="tab-register"
                aria-selected={mode === "register"}
                aria-controls="panel-register"
                className={`rx-auth-tab ${mode === "register" ? "rx-auth-tab--active" : ""}`}
                onClick={() => switchMode("register")}
              >
                Create Account
              </button>
            </div>

            {/* Success Alert */}
            {successMessage && (
              <div className="rx-auth-alert rx-auth-alert--success" role="status">
                <span aria-hidden="true">✓</span>
                {successMessage}
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="rx-auth-alert rx-auth-alert--error" role="alert">
                <span aria-hidden="true">⚠</span>
                {error}
              </div>
            )}

            {/* Sign In Form */}
            {mode === "login" ? (
              <form
                id="panel-signin"
                role="tabpanel"
                aria-labelledby="tab-signin"
                onSubmit={handleLoginSubmit}
              >
                <div className="rx-input-group">
                  <label htmlFor="login-email" className="rx-input-label">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className="rx-input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="rx-input-group">
                  <label htmlFor="login-password" className="rx-input-label">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="rx-input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="rx-auth-submit-btn"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span aria-hidden="true">⟳</span> Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="rx-auth-footer-switch">
                  Don&apos;t have an account?
                  <button
                    type="button"
                    className="rx-auth-switch-btn"
                    onClick={() => switchMode("register")}
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form
                id="panel-register"
                role="tabpanel"
                aria-labelledby="tab-register"
                onSubmit={handleRegisterSubmit}
              >
                <div className="rx-input-group">
                  <label htmlFor="reg-name" className="rx-input-label">
                    Full Name <span style={{ color: "var(--rx-danger)" }} aria-label="required">*</span>
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    className="rx-input-field"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>

                <div className="rx-input-group">
                  <label htmlFor="reg-email" className="rx-input-label">
                    Email Address <span style={{ color: "var(--rx-danger)" }} aria-label="required">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    className="rx-input-field"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="e.g. student@resolvex.edu"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="rx-input-group">
                  <label htmlFor="reg-password" className="rx-input-label">
                    Password <span style={{ color: "var(--rx-danger)" }} aria-label="required">*</span>
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    className="rx-input-field"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <div className="rx-input-group">
                  <label htmlFor="reg-confirm-password" className="rx-input-label">
                    Confirm Password <span style={{ color: "var(--rx-danger)" }} aria-label="required">*</span>
                  </label>
                  <input
                    id="reg-confirm-password"
                    type="password"
                    className="rx-input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  className="rx-auth-submit-btn"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span aria-hidden="true">⟳</span> Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="rx-auth-footer-switch">
                  Already have an account?
                  <button
                    type="button"
                    className="rx-auth-switch-btn"
                    onClick={() => switchMode("login")}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;