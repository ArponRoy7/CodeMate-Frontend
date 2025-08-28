import React from "react";
import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((s) => s.user);

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">Name:</span>{" "}
              {user?.name || user?.firstName || "—"}
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {user?.email || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <EditProfile user={user || {}} />
    </section>
  );
};

export default Profile;
