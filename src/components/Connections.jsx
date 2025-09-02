// src/components/Connections.jsx
import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { setConnections } from "../utils/connectionsSlice";
import { BASE_URL } from "../utils/constants";

/** Compact list-style connection card with "View Photo" modal trigger */
const ConnCard = ({ u, onViewPhoto }) => {
  const id = u?._id || u?.id;
  const photo = u?.photourl || u?.photoUrl || "";
  const name = u?.name || "Unnamed";
  const about = u?.about || "";

  return (
    <div className="card card-compact w-full bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Left: small rectangle thumbnail (space reserved even if no image) */}
          <div className="shrink-0">
            <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden bg-base-200 border border-base-300">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/200?u=conn-rect")}
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
            {photo && (
              <button
                type="button"
                className="btn btn-xs btn-ghost mt-1 w-full"
                onClick={() => onViewPhoto(photo, name)}
              >
                View Photo
              </button>
            )}
          </div>

          {/* Middle: text */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base truncate">{name}</h3>
            {about && <p className="text-xs sm:text-sm opacity-80 truncate">{about}</p>}
            {Array.isArray(u?.skills) && u.skills.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {u.skills.slice(0, 3).map((s) => (
                  <span key={s} className="badge badge-outline badge-sm">
                    {s}
                  </span>
                ))}
                {u.skills.length > 3 && (
                  <span className="badge badge-ghost badge-sm">+{u.skills.length - 3}</span>
                )}
              </div>
            )}
          </div>

          {/* Right: action */}
          <div className="shrink-0">
            {id ? (
              <Link
                to={`/chat/${id}`}
                state={{ target: { _id: id, name, photoUrl: photo || `https://i.pravatar.cc/600?u=${id}` } }}
                className="btn btn-secondary btn-sm normal-case"
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
    </div>
  );
};

export default function Connections() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.connections);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [photoModal, setPhotoModal] = React.useState(null); // { url, name }

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
    <section className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">Connections</h1>
        {loading && <span className="loading loading-dots loading-sm" />}
      </div>

      {/* Error */}
      {err && (
        <div className="alert alert-error shadow">
          <span className="text-sm sm:text-base">{err}</span>
        </div>
      )}

      {/* Loading skeleton (compact list) */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card card-compact bg-base-100 border border-base-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg bg-base-200 border border-base-300" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-3 w-64" />
                </div>
                <div className="skeleton h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : !items || items.length === 0 ? (
        // Empty state (compact)
        <div className="alert">
          <span>No connections yet. Start matching and your connections will appear here.</span>
        </div>
      ) : (
        // Compact list like Requests
        <div className="space-y-3">
          {items.map((u) => (
            <ConnCard key={u._id || u.id} u={u} onViewPhoto={(url, name) => setPhotoModal({ url, name })} />
          ))}
        </div>
      )}

      {/* Modal to view full photo */}
      {photoModal && (
        <dialog open className="modal">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-3">{photoModal.name}'s Photo</h3>
            <img
              src={photoModal.url}
              alt={photoModal.name}
              className="w-full rounded-lg object-cover"
              onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/600?u=conn-fallback")}
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setPhotoModal(null)}>Close</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setPhotoModal(null)}>close</button>
          </form>
        </dialog>
      )}
    </section>
  );
}
