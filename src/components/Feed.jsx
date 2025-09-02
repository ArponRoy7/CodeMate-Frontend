// Feed.jsx
import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { setFeed } from "../utils/feedSlice";
import ProfileCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);
  const feed = useSelector((s) => s.feed?.list || []);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [toast, setToast] = React.useState({ msg: "", type: "" }); // 'success' | 'error' | ''

  // ---- UI state ----
  const [viewMode, setViewMode] = React.useState("swipe"); // "swipe" | "grid"
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [searchInput, setSearchInput] = React.useState(""); // controlled input
  const [search, setSearch] = React.useState("");            // debounced value
  const [sortBy] = React.useState("name");                   // backend: name | age | createdAt
  const [sortOrder] = React.useState("asc");                 // "asc" | "desc"

  // ---- backend meta ----
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(0);
  const [totalUsers, setTotalUsers] = React.useState(0);

  const hasNext = page * limit < totalUsers;
  const hasPrev = page > 1;

  // debounce searchInput -> search (350ms)
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPage(1); // reset to first page on new search
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchFeed = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE_URL}/feed`, {
        withCredentials: true,
        params: { page, limit, search, sortBy, sortOrder },
      });
      // backend shape: { currentPage, pageSize, totalUsers, users }
      const { users = [], currentPage, pageSize, totalUsers } = res?.data || {};

      dispatch(setFeed(Array.isArray(users) ? users : []));
      setCurrentPage(currentPage || page);
      setPageSize(pageSize || users.length || 0);
      setTotalUsers(totalUsers || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load feed.");
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, limit, search, sortBy, sortOrder]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchFeed();
    })();
    return () => { cancelled = true; };
  }, [fetchFeed]);

  // Remove a single user from current feed list
  const removeUserFromFeed = React.useCallback((userId) => {
    const next = feed.filter(u => u._id !== userId);
    dispatch(setFeed(next));
    // If grid page becomes empty and there's a next page, advance
    if (next.length === 0 && hasNext) setPage(p => p + 1);
  }, [dispatch, feed, hasNext]);

  // Swipe-mode helper: remove first card
  const removeTopCard = React.useCallback(() => {
    if (!feed.length) return;
    removeUserFromFeed(feed[0]._id);
  }, [feed, removeUserFromFeed]);

  // Interested => POST /request/send/interested/:userId
  const handleInterested = async (userId) => {
    try {
      setToast({ msg: "", type: "" });
      await axios.post(`${BASE_URL}/request/send/interested/${userId}`, null, { withCredentials: true });
      setToast({ msg: "Request sent ✅", type: "success" });
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (!msg.toLowerCase().includes("already exists")) {
        console.error("Interested error:", err);
      }
    } finally {
      // Remove the acted-on user (works for both swipe + grid)
      viewMode === "swipe" ? removeTopCard() : removeUserFromFeed(userId);
      setTimeout(() => setToast({ msg: "", type: "" }), 1500);
    }
  };

  // Ignore => POST /request/send/ignored/:userId
  const handleIgnore = async (userId) => {
    try {
      setToast({ msg: "", type: "" });
      await axios.post(`${BASE_URL}/request/send/ignored/${userId}`, null, { withCredentials: true });
      setToast({ msg: "Ignored", type: "error" });
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (!msg.toLowerCase().includes("already exists")) {
        console.error("Ignore error:", err);
      }
    } finally {
      viewMode === "swipe" ? removeTopCard() : removeUserFromFeed(userId);
      setTimeout(() => setToast({ msg: "", type: "" }), 1200);
    }
  };

  const firstUser = feed?.[0];

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      {/* Toast (DaisyUI) */}
      {toast.msg && (
        <div className="toast toast-top inset-x-0 mt-16 z-50">
          <div className={`alert shadow-lg ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
            <span className="text-sm sm:text-base">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-1 sm:mb-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Hi {user?.name || user?.firstName || "there"} 👋
        </h1>
        <p className="opacity-80">Here’s your feed.</p>
      </header>

      {/* Controls: search, view mode, pagination */}
      <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
        <div className="card-body p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* LEFT: search & mode */}
            <div className="flex flex-1 items-center gap-2">
              <div className="join w-full">
                <input
                  type="text"
                  placeholder="Search by name or skill…"
                  className="input input-bordered join-item w-full"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button
                  className="btn join-item btn-ghost"
                  onClick={() => setSearchInput("")}
                  disabled={!searchInput}
                  title="Clear search"
                >
                  ✕
                </button>
              </div>

              <div className="join">
                <button
                  className={`btn join-item ${viewMode === "swipe" ? "btn-active" : "btn-ghost"}`}
                  onClick={() => setViewMode("swipe")}
                  disabled={loading}
                  title="Swipe mode: one card at a time"
                >
                  Swipe
                </button>
                <button
                  className={`btn join-item ${viewMode === "grid" ? "btn-active" : "btn-ghost"}`}
                  onClick={() => setViewMode("grid")}
                  disabled={loading}
                  title="Grid mode: multiple cards per page"
                >
                  Grid
                </button>
              </div>
            </div>

            {/* RIGHT: pagination */}
            <div className="flex items-center gap-2">
              <div className="opacity-80 text-sm hidden md:block">
                {totalUsers > 0 ? (
                  <>
                    Showing{" "}
                    <strong>
                      {totalUsers === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, totalUsers)}
                    </strong>{" "}
                    of <strong>{totalUsers}</strong>
                  </>
                ) : (
                  "No users yet"
                )}
              </div>

              <div className="join">
                <button
                  className="btn btn-sm join-item"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev || loading}
                >
                  ‹ Prev
                </button>
                <span className="btn btn-sm join-item btn-ghost pointer-events-none">
                  Page {currentPage || page}
                </span>
                <button
                  className="btn btn-sm join-item"
                  onClick={() => hasNext && setPage((p) => p + 1)}
                  disabled={!hasNext || loading}
                >
                  Next ›
                </button>

                <select
                  className="select select-sm join-item"
                  value={limit}
                  onChange={(e) => { setPage(1); setLimit(parseInt(e.target.value, 10)); }}
                  disabled={loading}
                  title="Cards per page"
                >
                  {[5, 10, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>{n}/page</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-2 flex items-center gap-2">
              <span className="loading loading-spinner" />
              <span className="opacity-80">Loading feed…</span>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error shadow">
          <span className="text-sm sm:text-base">{error}</span>
        </div>
      )}

      {/* CONTENT */}
      {!loading && !error && viewMode === "swipe" && firstUser && (
        <div className="flex justify-center my-4 sm:my-6">
          <ProfileCard
            key={firstUser._id}
            user={firstUser}
            onInterested={() => handleInterested(firstUser._id)}
            onIgnore={() => handleIgnore(firstUser._id)}
          />
        </div>
      )}

      {!loading && !error && viewMode === "grid" && feed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 my-4 sm:my-6">
          {feed.map((u) => (
            <ProfileCard
              key={u._id}
              user={u}
              onInterested={() => handleInterested(u._id)}
              onIgnore={() => handleIgnore(u._id)}
            />
          ))}
        </div>
      )}

      {!loading && !error && ((viewMode === "swipe" && !firstUser) || (viewMode === "grid" && feed.length === 0)) && (
        <div className="hero bg-base-200 rounded-2xl border border-base-300">
          <div className="hero-content text-center py-10 sm:py-14">
            <div className="max-w-md">
              <h3 className="text-xl sm:text-2xl font-semibold">All caught up 🎉</h3>
              <p className="opacity-80 mt-2">
                No more profiles on this page.
                {hasNext ? " Try Next →" : " Check back later!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Feed;
