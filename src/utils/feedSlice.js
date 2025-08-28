import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: { list: [], meta: { currentPage: 1, totalUsers: 0, pageSize: 0 } },
  reducers: {
    setFeed: (state, action) => {
      const payload = action.payload;

      // Accept:
      // - array
      // - { users: [...] }
      // - { data: [...] } (legacy)
      const list =
        Array.isArray(payload)
          ? payload
          : payload?.users || payload?.data || [];

      state.list = list;

      // Optional meta (if present)
      if (payload && !Array.isArray(payload)) {
        state.meta.currentPage = payload.currentPage ?? state.meta.currentPage;
        state.meta.totalUsers  = payload.totalUsers  ?? state.meta.totalUsers;
        state.meta.pageSize    = payload.pageSize    ?? state.meta.pageSize;
      }
    },
    clearFeed: (state) => {
      state.list = [];
      state.meta = { currentPage: 1, totalUsers: 0, pageSize: 0 };
    },
  },
});

export const { setFeed, clearFeed } = feedSlice.actions;
export default feedSlice.reducer;
