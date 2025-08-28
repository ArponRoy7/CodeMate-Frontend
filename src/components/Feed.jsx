import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { setFeed } from "../utils/feedSlice";
import UserCard from "./UserCard";

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);
  const feed = useSelector((s) => s.feed?.list || []);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    const getFeed = async () => {
      if (feed.length) return; // already in redux
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${BASE_URL}/feed`, { withCredentials: true });
        // Accept array, {users:[...]}, or {data:[...]}
        const data = res?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : [];

        console.log("FEED RESPONSE:", res.status, data, "=> list length:", list.length);

        if (!cancelled) dispatch(setFeed(list));
      } catch (err) {
        console.error("Feed error:", err);
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load feed.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getFeed();
    return () => {
      cancelled = true;
    };
  }, [dispatch, feed.length]);

  const firstUser = feed?.[0];

  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">
          Hi {user?.firstName || user?.name || "there"} 👋
        </h1>
        <p className="opacity-80">Here’s your seed feed.</p>
      </header>

      {loading && (
        <div className="flex items-center gap-2">
          <span className="loading loading-spinner" />
          <span className="opacity-80">Loading feed…</span>
        </div>
      )}

      {error && <p className="text-error">{error}</p>}

      {!loading && !error && firstUser && (
        <div className="flex justify-center my-10">
          <UserCard user={firstUser} />
        </div>
      )}

      {!loading && !error && !firstUser && (
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title">Welcome to CodeMate 🌱</h3>
            <p className="opacity-80">
              You are now logged in via your backend. Routes are protected by Redux state.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Feed;
