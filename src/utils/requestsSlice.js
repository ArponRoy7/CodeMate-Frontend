// src/utils/requestsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const requestsSlice = createSlice({
  name: "requests",
  initialState: { items: [], loaded: false },
  reducers: {
    setRequests: (s, a) => ({ items: a.payload || [], loaded: true }),
    removeRequestById: (s, a) => {
      s.items = s.items.filter(r => r._id !== a.payload);
    },
    clearRequests: () => ({ items: [], loaded: false }),
  },
});
export const { setRequests, removeRequestById, clearRequests } = requestsSlice.actions;
export default requestsSlice.reducer;
