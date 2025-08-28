import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { BASE_URL } from "../utils/constants";
import UserCard from "./UserCard";

const GENDER_OPTIONS = ["male", "female", "other"];

const fromUser = (u) => {
  const rawAge = u?.age;
  const ageStr =
    rawAge === null || rawAge === undefined
      ? ""
      : typeof rawAge === "number"
      ? String(rawAge)
      : String(rawAge).trim();

  const g = (u?.gender || "").toString().toLowerCase().trim();
  const gender = GENDER_OPTIONS.includes(g) ? g : "";

  return {
    name: (u?.name || u?.firstName || "").toString(),
    photoUrl: (u?.photoUrl || u?.photourl || "").toString(),
    age: ageStr,
    gender,
    about: (u?.about || "").toString(),
    skills: Array.isArray(u?.skills) ? u.skills : [],
  };
};

const arraysEqual = (a = [], b = []) => {
  if (a.length !== b.length) return false;
  const A = [...a].map((s) => s.toLowerCase()).sort();
  const B = [...b].map((s) => s.toLowerCase()).sort();
  return A.every((v, i) => v === B[i]);
};

const EditProfile = ({ user }) => {
  // derive stable initial form values from user
  const initial = useMemo(() => fromUser(user || {}), [user]);

  // --- local form state (drives preview) ---
  const [name, setName] = useState(initial.name);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [age, setAge] = useState(initial.age);
  const [gender, setGender] = useState(initial.gender);
  const [about, setAbout] = useState(initial.about);

  // skills
  const [skills, setSkills] = useState(initial.skills);
  const [skillInput, setSkillInput] = useState("");

  // re-sync form whenever Redux user changes (first visit async load)
  useEffect(() => {
    setName(initial.name);
    setPhotoUrl(initial.photoUrl);
    setAge(initial.age);
    setGender(initial.gender);
    setAbout(initial.about);
    setSkills(initial.skills);
  }, [initial.name, initial.photoUrl, initial.age, initial.gender, initial.about, initial.skills]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dispatch = useDispatch();

  // preview object – make sure name wins over first/last in UserCard
  const previewUser = {
    ...(user || {}),
    name,
    firstName: undefined,
    lastName: undefined,
    photoUrl,
    photourl: photoUrl,
    age: age === "" ? undefined : Number(age),
    gender,
    about,
    skills,
  };

  const trim = (v) => (typeof v === "string" ? v.trim() : v);

  // ---- Skills handlers ----
  const addSkill = () => {
    const s = trim(skillInput || "");
    if (!s) return;
    // prevent dupes (case-insensitive)
    const exists = skills.some((k) => k.toLowerCase() === s.toLowerCase());
    if (exists) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, s]);
    setSkillInput("");
  };

  const removeSkill = (index) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const onSkillKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const saveProfile = async () => {
    setError("");

    if (!trim(name)) {
      setError("Name cannot be empty.");
      return;
    }
    if (gender && !GENDER_OPTIONS.includes(gender)) {
      setError("Please select a valid gender.");
      return;
    }

    setSaving(true);
    try {
      // Build payload from current state (only changed fields)
      const base = fromUser(user);
      const payload = {};

      if (trim(name) !== trim(base.name)) payload.name = trim(name);

      if (trim(photoUrl) !== trim(base.photoUrl)) {
        payload.photoUrl = trim(photoUrl);
        payload.photourl = trim(photoUrl); // backend compat
      }

      if (trim(age) !== trim(base.age)) {
        const n = Number(age);
        if (!Number.isNaN(n)) payload.age = n;
      }

      if (gender && gender !== base.gender) payload.gender = gender;

      if (trim(about) !== trim(base.about)) payload.about = trim(about);

      if (!arraysEqual(skills, base.skills)) payload.skills = skills;

      if (Object.keys(payload).length === 0) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1500);
        setSaving(false);
        return;
      }

      // ✅ await and use the response
      const res = await axios.patch(`${BASE_URL}/profile/update`, payload, {
        withCredentials: true,
      });

      const updated =
        res?.data?.updatedFields ??
        res?.data?.data ??
        res?.data ??
        {};

      // Merge into Redux user
      dispatch(addUser({ ...(user || {}), ...updated }));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 1800);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save profile.";
      setError(msg);
      console.error("Edit profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName(initial.name);
    setPhotoUrl(initial.photoUrl);
    setAge(initial.age);
    setGender(initial.gender);
    setAbout(initial.about);
    setSkills(initial.skills);
    setSkillInput("");
    setError("");
  };

  return (
    <>
      {/* Success toast fixed just below navbar */}
      {showToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50">
          <div className="alert alert-success shadow-lg">
            <span>Profile updated successfully.</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* Editor */}
        <div className="card bg-base-100 border border-indigo-100 shadow-xl rounded-2xl">
          <div className="card-body space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 rounded bg-indigo-500" />
              <h2 className="card-title">Edit Profile</h2>
            </div>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium">Name</span>
              </div>
              <input
                type="text"
                className="input input-bordered focus:ring focus:ring-indigo-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Arpon Roy"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium">Photo URL</span>
              </div>
              <input
                type="text"
                className="input input-bordered focus:ring focus:ring-indigo-200"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://… or /uploads/…"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-medium">Age</span>
                </div>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered focus:ring focus:ring-indigo-200"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="24"
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text font-medium">Gender</span>
                </div>
                <select
                  className="select select-bordered focus:ring focus:ring-indigo-200"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium">About</span>
              </div>
              <textarea
                className="textarea textarea-bordered min-h-28 focus:ring focus:ring-indigo-200"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="A short bio about you"
              />
            </label>

            {/* Skills Editor */}
            <div className="space-y-2">
              <div className="label">
                <span className="label-text font-medium">Skills</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1 focus:ring focus:ring-indigo-200"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={onSkillKey}
                  placeholder="e.g., React"
                />
                <button type="button" className="btn btn-primary" onClick={addSkill}>
                  +
                </button>
              </div>

              {/* Existing skills as removable chips */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map((s, i) => (
                    <span
                      key={`${s}-${i}`}
                      className="badge badge-outline gap-2 border-indigo-200"
                    >
                      {s}
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs px-1"
                        onClick={() => removeSkill(i)}
                        aria-label={`Remove ${s}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-error">{error}</p>}

            <div className="card-actions justify-end items-center gap-3 pt-2">
              <button className="btn btn-ghost" onClick={resetForm} disabled={saving}>
                Reset
              </button>
              <button
                className={`btn btn-primary shadow-md hover:shadow-lg ${saving ? "btn-disabled" : ""}`}
                onClick={saveProfile}
                disabled={saving || !name.trim()}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    <span className="ml-2">Saving…</span>
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card bg-base-100 border border-indigo-100 shadow-xl rounded-2xl">
          <div className="card-body">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 rounded bg-indigo-500" />
              <h2 className="card-title">Preview</h2>
            </div>
            <div className="pt-2 flex items-start justify-center">
              <UserCard user={previewUser} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
