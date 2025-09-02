import React from "react";

const UserCard = ({ user, onInterested, onIgnore }) => {
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

  const displayName =
    (name && String(name)) ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    "User";

  const imageSrc =
    photoUrl || photourl || "https://i.pravatar.cc/256?u=codemate-fallback";

  return (
    <div className="card w-full max-w-sm bg-base-100 border border-base-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 rounded-2xl mx-auto">
      {/* Banner / image */}
      <figure className="relative overflow-hidden rounded-t-2xl">
        <img
          src={imageSrc}
          alt={displayName}
          className="h-60 w-full object-cover"
          loading="lazy"
          onError={(e) =>
            (e.currentTarget.src =
              "https://i.pravatar.cc/256?u=codemate-fallback")
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-100/60 via-transparent to-transparent" />
      </figure>

      <div className="card-body gap-3 p-5">
        {/* Name */}
        <h2 className="card-title text-xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500">
            {displayName}
          </span>
        </h2>

        {/* Meta row */}
        {(age || gender) && (
          <div className="flex flex-wrap items-center gap-2">
            {age && (
              <span className="badge badge-outline border-indigo-200 text-indigo-700">
                Age: {age}
              </span>
            )}
            {gender && (
              <span className="badge badge-outline border-indigo-200 text-indigo-700 capitalize">
                {gender}
              </span>
            )}
          </div>
        )}

        {/* About */}
        {about && (
          <p className="text-sm leading-relaxed opacity-80">{about}</p>
        )}

        {/* Skills */}
        {Array.isArray(skills) && skills.length > 0 && (
          <div className="mt-1">
            <div className="text-xs font-semibold opacity-70 mb-1">
              Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="badge border border-indigo-200/70 bg-indigo-50 text-indigo-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-between mt-3">
          <button
            type="button"
            onClick={onIgnore}
            className="btn btn-outline btn-error btn-sm sm:btn-md"
          >
            Ignore
          </button>
          <button
            type="button"
            onClick={onInterested}
            className="btn btn-primary btn-sm sm:btn-md shadow-md"
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
