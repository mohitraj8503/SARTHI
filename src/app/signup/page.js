"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [role, setRole] = useState("trainee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [division, setDivision] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleOAuthSignup = (provider) => {
    alert(`Initiating ${provider} Registration for SARTHI Portal...`);
  };

  const roles = [
    { id: "trainee", label: "Trainee" },
    { id: "trainer", label: "Trainer" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <div className="auth-container">
      {/* Mobile Top Header (Outside the Card) */}
      <div className="auth-mobile-header">
        <Link href="/" className="auth-mobile-home-pill">
          ← Home
        </Link>
        <div className="auth-mobile-logo-wrap">
          <img src="/images/sarthi-logo.png" alt="SARTHI Logo" className="auth-mobile-logo" />
        </div>
        <h1 className="auth-mobile-title">
          Join SARTHI Capacity Building Portal
        </h1>
      </div>

      {/* Left Branding Panel (Desktop Only) */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          <div style={{ marginBottom: "auto" }}>
            <Link href="/" className="auth-logo-badge">
              <img src="/images/sarthi-logo.png" alt="SARTHI Logo" style={{ height: "44px", width: "auto", display: "block" }} />
            </Link>
          </div>

          <div style={{ maxWidth: "520px", marginTop: "40px" }}>
            <h1 className="auth-headline">
              Join SARTHI Capacity Building Portal
            </h1>
            <p className="auth-subtext">
              Create an official account to access domain training, MCQ assessments, and verified certifications.
            </p>

            <div className="auth-stats-grid">
              <div className="auth-stat-card">
                <h3 className="auth-stat-value">Role-Based</h3>
                <p className="auth-stat-label">Trainee / Trainer / Admin</p>
              </div>
              <div className="auth-stat-card">
                <h3 className="auth-stat-value">Verified</h3>
                <p className="auth-stat-label">Official Certification</p>
              </div>
              <div className="auth-stat-card">
                <h3 className="auth-stat-value">24/7</h3>
                <p className="auth-stat-label">Trainer Library</p>
              </div>
            </div>
          </div>

          <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "40px" }}>
            © India Meteorological Department, Ministry of Earth Sciences
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right-panel">
        <div className="auth-card">
          <div className="auth-desktop-back">
            <Link href="/" className="auth-back-link">
              ← Back to Home
            </Link>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#0c211d", margin: "0 0 6px 0" }}>
              Create your account
            </h2>
            <p style={{ fontSize: "14px", color: "#556763", margin: 0 }}>
              Select your role and enter your official details.
            </p>
          </div>

          {/* Animated Framer Motion Role Switcher */}
          <div style={{ display: "flex", background: "#f0f4f3", borderRadius: "30px", padding: "4px", marginBottom: "20px", position: "relative" }}>
            {roles.map((r) => {
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  type="button"
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: "26px",
                    border: "none",
                    background: "transparent",
                    color: isActive ? "#ffffff" : "#4a5d58",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 2,
                    transition: "color 0.2s ease"
                  }}
                >
                  {r.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeRolePill"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "#0c211d",
                        borderRadius: "26px",
                        zIndex: -1,
                        boxShadow: "0 4px 12px rgba(12, 33, 29, 0.25)"
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rajesh Kumar"
                className="auth-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@imd.gov.in"
                className="auth-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                IMD Division / Station
              </label>
              <input
                type="text"
                required
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="NWP Division, New Delhi"
                className="auth-input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input"
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              Create Account →
            </button>
          </form>

          {submitted && (
            <div style={{ marginTop: "14px", padding: "12px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", fontSize: "13px" }}>
              ✓ Account created for <strong>{name}</strong> as <strong>{role.toUpperCase()}</strong> ({division}). Registration request sent for approval!
            </div>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0 20px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
          </div>

          {/* Social Sign-Up Buttons at Bottom */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handleOAuthSignup("Google")}
              className="social-btn google-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h6.38c-.28 1.48-1.13 2.73-2.4 3.58v2.97h3.88c2.27-2.09 3.7-5.17 3.7-8.56z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v3.06C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V6.84H2.18C1.43 8.35 1 10.12 1 12s.43 3.65 1.18 5.16l2.85-2.22.81-.85z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignup("GitHub")}
              className="social-btn github-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#1e5246", fontWeight: "700", textDecoration: "none" }}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
