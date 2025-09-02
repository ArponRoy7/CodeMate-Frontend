// src/components/EditProfile.jsx
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
  const initial = useMemo(() => fromUser(user || {}), [user]);

  const [name, setName] = useState(initial.name);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);
  const [age, setAge] = useState(initial.age);
  const [gender, setGender] = useState(initial.gender);
  const [about, setAbout] = useState(initial.about);

  const [skills, setSkills] = useState(initial.skills);
  const [skillInput, setSkillInput] = useState("");

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

  const addSkill = () => {
    const s = trim(skillInput || "");
    if (!s) return;
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
      const base = fromUser(user);
      const payload = {};

      if (trim(name) !== trim(base.name)) payload.name = trim(name);

      if (trim(photoUrl) !== trim(base.photoUrl)) {
        payload.photoUrl = trim(photoUrl);
        payload.photourl = trim(photoUrl);
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

      const res = await axios.patch(`${BASE_URL}/profile/update`, payload, {
        withCredentials: true,
      });

      const updated =
        res?.data?.updatedFields ?? res?.data?.data ?? res?.data ?? {};

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
      {showToast && (
        <div className="toast toast-top w-full inset-x-0 mt-16 z-50">
          <div className="w-full flex justify-center px-3">
            <div className="alert alert-success shadow-lg max-w-screen-sm w-full">
              <span>Profile updated successfully.</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-4 sm:mt-6">
        {/* Editor */}
        <div className="card bg-base-100 border border-base-200 shadow-xl rounded-2xl">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center gap-2">
              {/* 🔹 simple bullet instead of avatar placeholder */}
              <span className="text-primary text-xl leading-none">•</span>
              <h2 className="card-title text-lg sm:text-xl">Edit Profile</h2>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-4">
              <label className="form-control">
                <div className="label">
                  <span className="label-text font-medium">Name</span>
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Arpon Roy"
                />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text font-medium">Photo URL</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://… or /uploads/…"
                  />
                  <div className="avatar hidden sm:block">
                    <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                      <img
                        src={photoUrl || "https://i.pravatar.cc/120?u=preview"}
                        alt="preview"
                        onError={(e) => (e.currentTarget.src = "https://i.pravatar.cc/120?u=preview")}
                      />
                    </div>
                  </div>
                </div>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="form-control">
                  <div className="label">
                    <span className="label-text font-medium">Age</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered w-full"
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
                    className="select select-bordered w-full"
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
                  <span className="label-text-alt opacity-70">
                    A short bio about you
                  </span>
                </div>
                <textarea
                  className="textarea textarea-bordered min-h-28 w-full"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Tell others what you like to build…"
                />
              </label>

              {/* Skills Editor */}
              <div className="space-y-2">
                <div className="label">
                  <span className="label-text font-medium">Skills</span>
                </div>
                <div className="join w-full">
                  <input
                    type="text"
                    className="input input-bordered join-item w-full"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={onSkillKey}
                    placeholder="e.g., React"
                  />
                  <button type="button" className="btn btn-primary join-item" onClick={addSkill}>
                    Add
                  </button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {skills.map((s, i) => (
                      <span
                        key={`${s}-${i}`}
                        className="badge badge-outline gap-2"
                      >
                        {s}
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs px-1"
                          onClick={() => removeSkill(i)}
                          aria-label={`Remove ${s}`}
                          title={`Remove ${s}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="alert alert-error mt-1">
                  <span>{error}</span>
                </div>
              )}

              <div className="divider my-2" />

              <div className="card-actions justify-end items-center gap-3">
                <button className="btn btn-ghost" onClick={resetForm} disabled={saving}>
                  Reset
                </button>
                <button
                  className={`btn btn-primary ${saving ? "btn-disabled" : ""}`}
                  onClick={saveProfile}
                  disabled={saving || !name.trim()}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner" />
                      Saving…
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="card bg-base-100 border border-base-200 shadow-xl rounded-2xl">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center gap-2">
              {/* 🔸 simple bullet for preview title */}
              <span className="text-secondary text-xl leading-none">•</span>
              <h2 className="card-title text-lg sm:text-xl">Preview</h2>
            </div>
            <div className="pt-3 flex items-start justify-center">
              <UserCard user={previewUser} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
