import { createSlice } from "@reduxjs/toolkit";

const normalizeUser = (payload) => {
  if (!payload) return null;

  // Build a single `name`
  const joined =
    [payload.firstName, payload.lastName].filter(Boolean).join(" ").trim() || undefined;
  const name = (payload.name || joined || "").toString().trim();

  // Keep a single photo field but preserve both keys to avoid breaking any UI
  const photourl = payload.photourl ?? payload.photoUrl ?? "";
  const photoUrl = payload.photoUrl ?? payload.photourl ?? "";

  return {
    ...payload,
    name,                // <- canonical
    photourl,            // backend key
    photoUrl,            // frontend UI key
  };
};

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    // Replace the whole user with normalized snapshot
    addUser: (_state, action) => normalizeUser(action.payload),
    removeUser: () => null,
  },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
