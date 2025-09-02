// src/components/Requests.jsx
import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setRequests, removeRequestById } from "../utils/requestsSlice";
import { addConnection } from "../utils/connectionsSlice";

const Card = ({ user, onAccept, onReject, busy, onViewPhoto }) => {
  const name = user?.name || "Unnamed";
  const about = user?.about || "";
  const photo = user?.photourl || user?.photoUrl || "";

  return (
    <div className="card card-compact w-full bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Left: small rectangle thumbnail */}
          <div className="shrink-0">
            <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden bg-base-200 border border-base-300">
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) =>
                    (e.currentTarget.src = "https://i.pravatar.cc/200?u=req-rect")
                  }
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
            {about && (
              <p className="text-xs sm:text-sm opacity-80 truncate">{about}</p>
            )}
            {(user?.skills || []).length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {user.skills.slice(0, 3).map((s) => (
                  <span key={s} className="badge badge-outline badge-sm">
                    {s}
                  </span>
                ))}
                {user.skills.length > 3 && (
                  <span className="badge badge-ghost badge-sm">
                    +{user.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right: actions */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              className="btn btn-outline btn-sm"
              disabled={busy}
              onClick={onReject}
            >
              {busy ? <span className="loading loading-spinner loading-xs" /> : "Reject"}
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={onAccept}
            >
              {busy ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Accepting…
                </>
              ) : (
                "Accept"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Requests() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.requests);
  const [loadingId, setLoadingId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [photoModal, setPhotoModal] = React.useState(null); // { url, name }

  React.useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/user/requests/received", { withCredentials: true });
        dispatch(setRequests(res.data?.data || []));
      } catch (e) {
        console.error("Fetch requests failed:", e);
        dispatch(setRequests([]));
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  const review = async (id, status, fromUser) => {
    try {
      setLoadingId(id);
      await axios.post(`/api/request/review/${status}/${id}`, {}, { withCredentials: true });
      dispatch(removeRequestById(id));
      if (status === "accepted" && fromUser) {
        dispatch(addConnection(fromUser));
      }
    } catch (e) {
      console.error(`Review ${status} failed:`, e);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-3 sm:px-4 py-6 space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Requests Received</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card card-compact bg-base-100 border border-base-200 rounded-xl p-4">
              <div className="skeleton h-14 w-20" />
              <div className="skeleton h-4 w-40 mt-2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="alert">
          <span>No connection requests right now.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card
              key={r._id}
              user={r.fromUserId}
              busy={loadingId === r._id}
              onAccept={() => review(r._id, "accepted", r.fromUserId)}
              onReject={() => review(r._id, "rejected")}
              onViewPhoto={(url, name) => setPhotoModal({ url, name })}
            />
          ))}
        </div>
      )}

      {/* Modal for viewing full photo */}
      {photoModal && (
        <dialog open className="modal">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-3">{photoModal.name}'s Photo</h3>
            <img
              src={photoModal.url}
              alt={photoModal.name}
              className="w-full rounded-lg object-cover"
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setPhotoModal(null)}>
                Close
              </button>
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
