import React from "react";
import { useSelector } from "react-redux";

const Feed = () => {
  const user = useSelector((s) => s.user);
  return (
    <section className="max-w-4xl mx-auto space-y-4">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Hi {user?.firstName || user?.name || "there"} 👋</h1>
        <p className="opacity-80">Here’s your seed feed.</p>
      </header>
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <h3 className="card-title">Welcome to CodeMate 🌱</h3>
          <p className="opacity-80">You are now logged in via your backend. Routes are protected by Redux state.</p>
        </div>
      </div>
    </section>
  );
};

export default Feed;
