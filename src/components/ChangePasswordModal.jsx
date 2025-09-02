// src/components/ChangePassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const isStrong = (pwd) =>
  typeof pwd === "string" &&
  pwd.length >= 8 &&
  /[A-Z]/.test(pwd) &&
  /[a-z]/.test(pwd) &&
  /\d/.test(pwd) &&
  /[^A-Za-z0-9]/.test(pwd);

const ChangePassword = () => {
  const [oldpassword, setOld] = useState("");
  const [newpassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ type: "", msg: "" });

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: "", msg: "" }), 2500);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!oldpassword) return showToast("error", "Please enter your current password.");
    if (!isStrong(newpassword))
      return showToast(
        "error",
        "New password must be 8+ chars, include upper, lower, number, and symbol."
      );
    if (newpassword !== confirm)
      return showToast("error", "New password and confirm password do not match.");

    setLoading(true);
    try {
      await axios.patch(
        `${BASE_URL}/profile/password`,
        { oldpassword, newpassword },
        { withCredentials: true }
      );
      showToast("success", "Password updated successfully.");
      setOld("");
      setNew("");
      setConfirm("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (/not valid/i.test(err?.response?.data)
          ? "Old password is incorrect."
          : null) ||
        "Failed to update password.";
      showToast("error", msg);
      console.error("Change password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-0">
      {/* Inline toast under navbar */}
      {toast.msg && (
        <div className="toast toast-top mt-4 z-40">
          <div
            className={[
              "alert shadow-lg",
              toast.type === "success" ? "alert-success" : "alert-error",
            ].join(" ")}
          >
            <span className="text-sm sm:text-base">{toast.msg}</span>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl border border-base-200 rounded-2xl">
        <div className="card-body p-4 sm:p-6">
          <div className="flex items-center gap-2">
            {/* 🔹 simple bullet instead of circle avatar */}
            <span className="text-primary text-xl">•</span>
            <h1 className="card-title text-lg sm:text-xl">Change password</h1>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <label className="form-control">
              <div className="label">
                <span className="label-text">Current password</span>
              </div>
              <input
                type="password"
                className="input input-bordered w-full"
                value={oldpassword}
                onChange={(e) => setOld(e.target.value)}
                required
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">New password</span>
                </div>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={newpassword}
                  onChange={(e) => setNew(e.target.value)}
                  required
                />
                <div className="label flex-wrap gap-2">
                  <span className="label-text-alt opacity-70">
                    8+ chars, upper, lower, number & symbol.
                  </span>
                  <span
                    className={[
                      "badge ml-auto",
                      newpassword
                        ? isStrong(newpassword)
                          ? "badge-success"
                          : "badge-warning"
                        : "badge-ghost",
                    ].join(" ")}
                  >
                    {newpassword ? (isStrong(newpassword) ? "Strong" : "Weak") : "—"}
                  </span>
                </div>
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Confirm new password</span>
                </div>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </label>
            </div>

            <div className="divider my-2 sm:my-3" />

            <div className="card-actions justify-end">
              <button className="btn btn-primary min-w-40" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading loading-spinner" />
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChangePassword;
