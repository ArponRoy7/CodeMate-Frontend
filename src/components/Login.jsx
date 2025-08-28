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
      // interim (in case /profile/view fails)
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
      // build payload
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

      if (skillsInput.trim()) payload.skills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);

      // create + cookie
      const res = await axios.post(`${BASE_URL}/signup`, payload, { withCredentials: true });

      // set user from signup response (safe snapshot), then hydrate
      dispatch(addUser(res.data));
      await hydrateProfile();

      // go to feed directly
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
    <section className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 border border-base-300 shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Welcome Back" : "Create your account"}
          </h1>
          <p className="text-sm opacity-90">
            {mode === "login"
              ? "Sign in to continue to CodeMate"
              : "Join CodeMate in seconds"}
          </p>
        </div>

        {/* Body */}
        <div className="card-body">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Email Address</span>
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full focus:ring focus:ring-indigo-200"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  required
                />
              </label>

              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text font-medium">Password</span>
                </div>
                <input
                  type="password"
                  className="input input-bordered w-full focus:ring focus:ring-indigo-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              {error && <p className="text-error text-sm font-medium">{error}</p>}

              <button
                type="submit"
                className={`btn btn-primary w-full shadow-md hover:shadow-lg transition-all ${loading ? "btn-disabled" : ""}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-sm text-center mt-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="form-control">
                  <div className="label"><span className="label-text font-medium">Name</span></div>
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
                  <div className="label"><span className="label-text font-medium">Age</span></div>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="24"
                  />
                </label>
              </div>

              <label className="form-control">
                <div className="label"><span className="label-text font-medium">Gender</span></div>
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
                <div className="label"><span className="label-text font-medium">Email Address</span></div>
                <input
                  type="email"
                  className="input input-bordered"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  required
                />
              </label>

              <label className="form-control">
                <div className="label"><span className="label-text font-medium">Password</span></div>
                <input
                  type="password"
                  className="input input-bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>

              <label className="form-control">
                <div className="label"><span className="label-text font-medium">Photo URL</span></div>
                <input
                  type="text"
                  className="input input-bordered"
                  value={photourl}
                  onChange={(e) => setPhotourl(e.target.value)}
                  placeholder="https://… or /uploads/…"
                />
              </label>

              <label className="form-control">
                <div className="label"><span className="label-text font-medium">About</span></div>
                <textarea
                  className="textarea textarea-bordered min-h-24"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="A short bio about you"
                />
              </label>

              <label className="form-control">
                <div className="label"><span className="label-text font-medium">Skills</span></div>
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

              {error && <p className="text-error text-sm font-medium">{error}</p>}

              <div className="flex items-center justify-between gap-3">
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
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? "btn-disabled" : ""}`}
                  disabled={loading}
                >
                  {loading ? "Creating…" : "Create account"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;
