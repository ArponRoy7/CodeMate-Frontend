// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const GENDER_OPTIONS = ["male", "female", "other"];

const Login = () => {
  const [mode, setMode] = useState("login"); // "login" | "signup"

  // login fields
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");

  // signup fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [photourl, setPhotourl] = useState("");
  const [about, setAbout] = useState("");
  const [skillsInput, setSkillsInput] = useState(""); // comma-separated

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/feed";

  const hydrateProfile = async () => {
    try {
      const me = await axios.get(`${BASE_URL}/profile/view`, { withCredentials: true });
      dispatch(addUser(me.data));
    } catch (hydrationErr) {
      console.warn("Profile hydration failed:", hydrationErr);
    }
  };

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        { email: emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      await hydrateProfile();
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.message ||
          "Invalid Credentials !! Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: (name || "").trim(),
        email: (emailId || "").trim(),
        password,
        photourl: (photourl || "").trim(),
        about: (about || "").trim(),
        gender,
      };

      if (age !== "") {
        const n = Number(age);
        if (!Number.isNaN(n)) payload.age = n;
      }

      if (skillsInput.trim())
        payload.skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);

      const res = await axios.post(`${BASE_URL}/signup`, payload, { withCredentials: true });
      dispatch(addUser(res.data));
      await hydrateProfile();
      navigate("/feed", { replace: true });
    } catch (err) {
      console.error("Signup error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Sign up failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-start sm:items-center justify-center px-3 sm:px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Card */}
        <div className="card bg-base-100 border border-base-300 shadow-xl rounded-2xl overflow-hidden">
          {/* Header: gradient + compact segmented toggle */}
          <div className="relative">
            <div className="bg-gradient-to-r from-primary via-fuchsia-500 to-secondary text-primary-content px-5 sm:px-6 py-5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm sm:text-base opacity-90">
                {mode === "login" ? "Sign in to continue to CodeMate" : "Join CodeMate in seconds"}
              </p>
            </div>

            {/* Segmented control — always visible, aligned top-right, no layout jump */}
            <div className="absolute right-3 top-3">
              <div className="join">
                <button
                  type="button"
                  className={`btn btn-xs sm:btn-sm join-item ${
                    mode === "login" ? "btn-neutral" : "btn-ghost"
                  }`}
                  onClick={() => { setMode("login"); setError(""); }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`btn btn-xs sm:btn-sm join-item ${
                    mode === "signup" ? "btn-neutral" : "btn-ghost"
                  }`}
                  onClick={() => { setMode("signup"); setError(""); }}
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="card-body p-4 sm:p-6">
            {/* Mobile tabs (for tiny screens) */}
            <div className="sm:hidden mb-4">
              <div className="tabs tabs-boxed w-full">
                <button
                  className={`tab w-1/2 ${mode === "login" ? "tab-active" : ""}`}
                  onClick={() => { setMode("login"); setError(""); }}
                >
                  Login
                </button>
                <button
                  className={`tab w-1/2 ${mode === "signup" ? "tab-active" : ""}`}
                  onClick={() => { setMode("signup"); setError(""); }}
                >
                  Sign up
                </button>
              </div>
            </div>

            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium">Email Address</span>
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </label>

                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text font-medium">Password</span>
                  </div>
                  <input
                    type="password"
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </label>

                {error && (
                  <div className="alert alert-error">
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="loading loading-spinner" />
                      Logging in…
                    </>
                  ) : (
                    "Login"
                  )}
                </button>

                <div className="text-sm text-center">
                  <span className="opacity-80">Don’t have an account? </span>
                  <button
                    type="button"
                    className="link link-primary font-medium"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                  >
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* 2-col layout on md+; keeps fields aligned & non-overlapping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="form-control">
                    <div className="label">
                      <span className="label-text font-medium">Name</span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g., Arpon Roy"
                    />
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text font-medium">Age</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="24"
                    />
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text font-medium">Gender</span>
                    </div>
                    <select
                      className="select select-bordered"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text font-medium">Email Address</span>
                    </div>
                    <input
                      type="email"
                      className="input input-bordered"
                      value={emailId}
                      onChange={(e) => setEmailId(e.target.value)}
                      required
                      placeholder="you@example.com"
                    />
                  </label>

                  {/* Photo URL spans both on small screens, one col on md */}
                  <label className="form-control md:col-span-1">
                    <div className="label">
                      <span className="label-text font-medium">Photo URL</span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={photourl}
                      onChange={(e) => setPhotourl(e.target.value)}
                      placeholder="https://… or /uploads/…"
                    />
                  </label>

                  <label className="form-control">
                    <div className="label">
                      <span className="label-text font-medium">Password</span>
                    </div>
                    <input
                      type="password"
                      className="input input-bordered"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a password"
                    />
                  </label>

                  {/* About (full width on md+) */}
                  <label className="form-control md:col-span-2">
                    <div className="label">
                      <span className="label-text font-medium">About</span>
                    </div>
                    <textarea
                      className="textarea textarea-bordered min-h-28"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="A short bio about you"
                    />
                  </label>

                  {/* Skills (full width on md+) */}
                  <label className="form-control md:col-span-2">
                    <div className="label">
                      <span className="label-text font-medium">Skills</span>
                    </div>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="Comma-separated, e.g., React, Node.js"
                    />
                    {skillsInput.trim() && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skillsInput
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((s, i) => (
                            <span key={`${s}-${i}`} className="badge badge-outline">
                              {s}
                            </span>
                          ))}
                      </div>
                    )}
                  </label>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                  >
                    Back to Login
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="loading loading-spinner" />
                        Creating…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Subtle helper text */}
        <p className="text-center text-xs opacity-60 mt-3">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </section>
  );
};

export default Login;
