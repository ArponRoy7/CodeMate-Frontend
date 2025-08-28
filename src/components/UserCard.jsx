import React from "react";

const UserCard = ({ user }) => {
  if (!user) return null;

  const {
    firstName,
    lastName,
    name,
    photourl,
    photoUrl,
    age,
    gender,
    about,
    skills = [],
  } = user;

  const fullName = (firstName || name || "User") + (lastName ? ` ${lastName}` : "");
  const avatar =
    photoUrl || photourl || "https://i.pravatar.cc/256?u=codemate-fallback";

  return (
    <div
      className={[
        "card w-[22rem] bg-base-100 border border-base-200 shadow-lg",
        "rounded-2xl overflow-hidden transition-all duration-200",
        "hover:shadow-xl hover:-translate-y-0.5",
      ].join(" ")}
    >
      {/* Top image */}
      <figure className="bg-base-200">
        <img
          src={avatar}
          alt={`${fullName} photo`}
          className="object-cover h-56 w-full"
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/256?u=codemate-fallback")}
        />
      </figure>

      {/* Body */}
      <div className="card-body gap-3">
        <div className="flex items-start justify-between">
          <h2 className="card-title leading-tight">
            {fullName}
          </h2>
          {(age || gender) && (
            <div className="text-xs px-2 py-1 rounded-lg bg-base-200">
              {age && <span>Age: {age}</span>}
              {age && gender ? <span className="mx-1">•</span> : null}
              {gender && <span>Gender: {gender}</span>}
            </div>
          )}
        </div>

        {about && (
          <p className="text-sm opacity-90">
            {about}
          </p>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-1">Skills</div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 10).map((sk, i) => (
                <span
                  key={i}
                  className="badge badge-outline border-indigo-200 text-indigo-700"
                >
                  {sk}
                </span>
              ))}
              {skills.length > 10 && (
                <span className="badge badge-ghost">+{skills.length - 10} more</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="card-actions justify-center mt-2">
          <button
            className="btn btn-outline btn-error min-w-28"
            aria-label="Ignore user"
          >
            Ignore
          </button>
          <button
            className="btn btn-primary min-w-28 shadow-sm hover:shadow-md"
            aria-label="Interested in user"
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
