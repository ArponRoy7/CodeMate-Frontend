// src/utils/connectionsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const connectionsSlice = createSlice({
  name: "connections",
  initialState: { items: [], loaded: false },
  reducers: {
    setConnections: (s, a) => ({ items: a.payload || [], loaded: true }),
    addConnection: (s, a) => { s.items.unshift(a.payload); },
    clearConnections: () => ({ items: [], loaded: false }),
  },
});
export const { setConnections, addConnection, clearConnections } = connectionsSlice.actions;
export default connectionsSlice.reducer;
