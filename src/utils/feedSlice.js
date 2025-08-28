// src/utils/feedSlice.js
import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: { list: [] },
  reducers: {
    setFeed: (state, action) => {
      const data = action.payload;
      state.list = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data?.data)
        ? data.data
        : [];
    },
    // Remove a user from the list by _id (used after interested/ignored)
    removeById: (state, action) => {
      const id = action.payload;
      state.list = state.list.filter((u) => String(u?._id) !== String(id));
    },
    // In case of a failed optimistic update, push back the user at the front
    unshiftUser: (state, action) => {
      const user = action.payload;
      if (user) state.list = [user, ...state.list];
    },
    clearFeed: (state) => {
      state.list = [];
    },
  },
});

export const { setFeed, removeById, unshiftUser, clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
