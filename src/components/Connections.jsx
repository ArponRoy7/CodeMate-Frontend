// src/components/Connections.jsx
import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setConnections } from "../utils/connectionsSlice";

const ConnCard = ({ u }) => (
  <div className="card w-full bg-base-100 border border-base-200 shadow-sm rounded-2xl">
    <figure className="bg-base-200">
      <img
        src={u?.photourl || u?.photoUrl || "https://i.pravatar.cc/600?u=conn"}
        alt={u?.name}
        className="h-40 w-full object-cover"
        onError={(e)=> e.currentTarget.src="https://i.pravatar.cc/600?u=conn"}
      />
    </figure>
    <div className="card-body">
      <h3 className="card-title">{u?.name}</h3>
      <p className="opacity-80">{u?.about}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {(u?.skills || []).map((s) => (
          <span key={s} className="badge badge-outline">{s}</span>
        ))}
      </div>
    </div>
  </div>
);

export default function Connections() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.connections);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/user/connections", { withCredentials: true });
        // your sample API returns array of user objects
        dispatch(setConnections(res.data || []));
      } catch (e) {
        console.error("Fetch connections failed:", e);
        dispatch(setConnections([]));
      }
    })();
  }, [dispatch]);

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Connections</h1>
      {items.length === 0 ? (
        <div className="alert">No connections yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((u) => (
            <ConnCard key={u._id} u={u} />
          ))}
        </div>
      )}
    </section>
  );
}
