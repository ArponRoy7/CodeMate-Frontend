import React from "react";
import { useSelector } from "react-redux";

const Profile = () => {
  const user = useSelector((s) => s.user);
  return (
    <section className="max-w-2xl mx-auto">
      <div className="card bg-base-100 border border-base-200">
        <div className="card-body">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="mt-4 space-y-2">
            <div><span className="font-semibold">Name:</span> {user?.firstName || user?.name || "—"}</div>
            <div><span className="font-semibold">Email:</span> {user?.email || "—"}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
