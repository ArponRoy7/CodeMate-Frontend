import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/feed";

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading(true);

    try {
      // 1) Authenticate (sets cookie)
      const res = await axios.post(
        `${BASE_URL}/login`,
        { email: emailId, password },
        { withCredentials: true }
      );

      // Optional: set whatever login returns (interim data)
      dispatch(addUser(res.data));

      // 2) Immediately hydrate with canonical profile snapshot
      try {
        const me = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        dispatch(addUser(me.data)); // overwrite with fresh DB data
      } catch (hydrationErr) {
        // If hydration fails, keep interim user; still navigate
        console.warn("Profile hydration failed:", hydrationErr);
      }

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

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 border border-base-300 shadow-xl rounded-2xl overflow-hidden">
        {/* Header strip */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-sm opacity-90">Sign in to continue to CodeMate</p>
        </div>

        {/* Form body */}
        <div className="card-body">
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
              className={`btn btn-primary w-full shadow-md hover:shadow-lg transition-all ${
                loading ? "btn-disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
