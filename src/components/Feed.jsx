import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { setFeed } from "../utils/feedSlice";
import ProfileCard from "./UserCard"; // same component, just used as ProfileCard here

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);
  const feed = useSelector((s) => s.feed?.list || []);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [toast, setToast] = React.useState({ msg: "", type: "" }); // type: 'success' | 'error' | ''

  // initial fetch
  React.useEffect(() => {
    let cancelled = false;

    const getFeed = async () => {
      if (feed.length) return; // already in redux
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${BASE_URL}/feed`, { withCredentials: true });
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : [];
        if (!cancelled) dispatch(setFeed(list));
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load feed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getFeed();
    return () => { cancelled = true; };
  }, [dispatch, feed.length]);

  const removeTopCard = React.useCallback(() => {
    dispatch(setFeed(feed.slice(1)));
  }, [dispatch, feed]);

  const firstUser = feed?.[0];

  // Interested => POST /request/send/interested/:userId
  const handleInterested = async (userId) => {
    try {
      setToast({ msg: "", type: "" });
      await axios.post(`${BASE_URL}/request/send/interested/${userId}`, null, { withCredentials: true });
      // show green toast briefly
      setToast({ msg: "Request sent ✅", type: "success" });
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      // If already exists, silently skip to next card
      if (msg.toLowerCase().includes("already exists")) {
        // no toast
      } else {
        // unexpected error → still skip card, but don’t spam errors
        console.error("Interested error:", err);
      }
    } finally {
      removeTopCard(); // always advance to next
      setTimeout(() => setToast({ msg: "", type: "" }), 1500);
    }
  };

  // Ignore => POST /request/send/ignored/:userId
  const handleIgnore = async (userId) => {
    try {
      setToast({ msg: "", type: "" });
      await axios.post(`${BASE_URL}/request/send/ignored/${userId}`, null, { withCredentials: true });
      // red toast for ignore
      setToast({ msg: "Ignored", type: "error" });
    } catch (err) {
      const msg = err?.response?.data?.message || "";
      if (msg.toLowerCase().includes("already exists")) {
        // silently skip
      } else {
        console.error("Ignore error:", err);
      }
    } finally {
      removeTopCard(); // always advance
      setTimeout(() => setToast({ msg: "", type: "" }), 1200);
    }
  };

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <header className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold">
          Hi {user?.name || user?.firstName || "there"} 👋
        </h1>
        <p className="opacity-80">Here’s your feed.</p>
      </header>

      {/* toast (only when we actually want to show one) */}
      {toast.msg && (
        <div
          className={[
            "alert shadow-sm",
            toast.type === "success" ? "alert-success" : "alert-error",
          ].join(" ")}
        >
          <span>{toast.msg}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner" />
          <span className="opacity-80">Loading feed…</span>
        </div>
      )}

      {error && <p className="text-error">{error}</p>}

      {!loading && !error && firstUser && (
        <div className="flex justify-center my-6">
          <ProfileCard
            key={firstUser._id}              // force fresh image/DOM
            user={firstUser}
            onInterested={() => handleInterested(firstUser._id)}
            onIgnore={() => handleIgnore(firstUser._id)}
          />
        </div>
      )}

      {!loading && !error && !firstUser && (
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">All caught up 🎉</h3>
            <p className="opacity-80">
              No more profiles to show right now. Check back later!
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Feed;
