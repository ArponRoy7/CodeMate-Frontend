// src/components/Requests.jsx
import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setRequests, removeRequestById } from "../utils/requestsSlice";
import { addConnection } from "../utils/connectionsSlice";

const Card = ({ user, onAccept, onReject, busy }) => (
  <div className="card w-full bg-base-100 border border-base-200 shadow-sm rounded-2xl">
    <figure className="bg-base-200">
      <img
        src={user?.photourl || user?.photoUrl || "https://i.pravatar.cc/600?u=req"}
        alt={user?.name}
        className="h-48 w-full object-cover"
        onError={(e)=> e.currentTarget.src="https://i.pravatar.cc/600?u=req"}
      />
    </figure>
    <div className="card-body">
      <h3 className="card-title">{user?.name}</h3>
      <p className="opacity-80">{user?.about}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {(user?.skills || []).map((s) => (
          <span key={s} className="badge badge-outline">{s}</span>
        ))}
      </div>
      <div className="card-actions justify-end mt-4">
        <button className="btn btn-outline" disabled={busy} onClick={onReject}>Reject</button>
        <button className="btn btn-primary" disabled={busy} onClick={onAccept}>Accept</button>
      </div>
    </div>
  </div>
);

export default function Requests() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.requests);
  const [loadingId, setLoadingId] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/user/requests/received", { withCredentials: true });
        // your sample API: { message, data: [ { _id, fromUserId: {...} } ] }
        dispatch(setRequests(res.data?.data || []));
      } catch (e) {
        console.error("Fetch requests failed:", e);
        dispatch(setRequests([]));
      }
    })();
  }, [dispatch]);

  const review = async (id, status, fromUser) => {
    try {
      setLoadingId(id);
      await axios.post(`/api/request/review/${status}/${id}`, {}, { withCredentials: true });
      dispatch(removeRequestById(id));
      if (status === "accepted" && fromUser) {
        // Normalize connection card shape (store the user object)
        dispatch(addConnection(fromUser));
      }
    } catch (e) {
      console.error(`Review ${status} failed:`, e);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Requests Received</h1>
      {items.length === 0 ? (
        <div className="alert">No requests right now.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((r) => (
            <Card
              key={r._id}
              user={r.fromUserId}
              busy={loadingId === r._id}
              onAccept={() => review(r._id, "accepted", r.fromUserId)}
              onReject={() => review(r._id, "rejected")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
