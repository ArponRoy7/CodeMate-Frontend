// src/components/Connections.jsx
import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setConnections } from "../utils/connectionsSlice";
import { BASE_URL } from "../utils/constants";

const ConnCard = ({ u }) => {
  const id = u?._id || u?.id;
  const photo =
    u?.photourl || u?.photoUrl || `https://i.pravatar.cc/600?u=${id || "conn"}`;

  return (
    <div className="card w-full bg-base-100 border border-base-200 shadow-sm rounded-2xl">
      <figure className="bg-base-200">
        <img
          src={photo}
          alt={u?.name || "User"}
          className="h-40 w-full object-cover"
          onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/600?u=conn")}
        />
      </figure>
      <div className="card-body">
        <h3 className="card-title">{u?.name || "Unnamed"}</h3>
        {u?.about && <p className="opacity-80">{u.about}</p>}

        {Array.isArray(u?.skills) && u.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {u.skills.map((s) => (
              <span key={s} className="badge badge-outline">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions justify-end mt-4">
          {id ? (
            <Link
              to={`/chat/${id}`}
              state={{ target: { _id: id, name: u?.name || "", photoUrl: photo } }} // ← pass to Chat
              className="btn btn-secondary btn-sm"
            >
              Chat
            </Link>
          ) : (
            <button className="btn btn-secondary btn-sm" disabled>
              Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Connections() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.connections);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let mounted = true;

    const fetchConnections = async () => {
      setLoading(true);
      setErr("");
      try {
        let res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.connections || [];
        if (mounted) {
          dispatch(setConnections(data));
          setLoading(false);
        }
      } catch (e1) {
        try {
          const res2 = await axios.get(`${BASE_URL}/api/user/connections`, {
            withCredentials: true,
          });
          const data2 = Array.isArray(res2.data) ? res2.data : res2.data?.connections || [];
          if (mounted) {
            dispatch(setConnections(data2));
            setLoading(false);
          }
        } catch (e2) {
          console.error("Fetch connections failed:", e1, e2);
          if (mounted) {
            dispatch(setConnections([]));
            setErr(
              e2?.response?.data?.error ||
                e1?.response?.data?.error ||
                "Unable to load connections. Check API path and auth."
            );
            setLoading(false);
          }
        }
      }
    };

    fetchConnections();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Connections</h1>
        {loading && <span className="loading loading-dots loading-sm" />}
      </div>

      {err && (
        <div className="alert alert-error">
          <span>{err}</span>
        </div>
      )}

      {!loading && (!items || items.length === 0) ? (
        <div className="alert">No connections yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((u) => (
            <ConnCard key={u._id || u.id} u={u} />
          ))}
        </div>
      )}
    </section>
  );
}
