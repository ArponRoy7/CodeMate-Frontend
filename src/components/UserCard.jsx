// UserCard.jsx
import React from "react";

const UserCard = ({ user }) => {
  if (!user) return null;

  const {
    name,
    firstName,
    lastName,
    photourl,
    photoUrl,
    age,
    gender,
    about,
    skills,
  } = user || {};

  // Prefer single "name" over first/last (so live edits reflect immediately)
  const displayName =
    (name && String(name)) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "User";

  const imageSrc =
    photoUrl || photourl || "https://i.pravatar.cc/256?u=codemate-fallback";

  return (
    <div className="card bg-base-100 w-96 shadow-xl border border-base-200">
      <figure className="bg-base-200">
        <img
          src={imageSrc}
          alt={displayName}
          className="object-cover h-56 w-full"
          onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/256?u=codemate-fallback")}
          loading="lazy"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{displayName}</h2>

        {(age || gender) && (
          <div className="badge badge-ghost">
            {age ? `Age: ${age}` : null}
            {age && gender ? " • " : ""}
            {gender ? `Gender: ${gender}` : null}
          </div>
        )}

        {about && <p className="mt-2">{about}</p>}

        {Array.isArray(skills) && skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={`${s}-${i}`} className="badge badge-outline">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions justify-center mt-4">
          <button className="btn btn-outline btn-error">Ignore</button>
          <button className="btn btn-primary">Interested</button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
