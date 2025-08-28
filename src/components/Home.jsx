import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const user = useSelector((s) => s.user);
  const navigate = useNavigate();

  if (user) {
    return (
      <section className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Welcome back, {user.firstName || user.name || "friend"} 👋
        </h1>
        <p className="text-lg text-base-content/80 mb-6">
          Your personalized feed is waiting — full of updates, insights, and opportunities curated just for you.
        </p>
        <p className="text-base text-base-content/70 mb-8">
          Jump back in to explore fresh posts, continue conversations, and stay connected with the community.
        </p>
        <button
          className="btn btn-primary btn-lg shadow-md hover:shadow-lg transition-all"
          onClick={() => navigate("/feed")}
        >
          Go to My Feed
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto text-center py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Welcome to <span className="text-indigo-600">CodeMate</span>
      </h1>
      <p className="text-lg text-base-content/80 mb-6">
        The professional space where developers, creators, and innovators connect.
      </p>
      <p className="text-base text-base-content/70 mb-8">
        Sign in to unlock your personalized feed, share your ideas, and collaborate with peers across the globe.  
        Whether you’re here to learn, build, or inspire, CodeMate is your digital hub for growth.
      </p>
      <button
        className="btn btn-primary btn-lg shadow-md hover:shadow-lg transition-all"
        onClick={() => navigate("/login")}
      >
        Get Started / Login
      </button>
    </section>
  );
};

export default Home;
