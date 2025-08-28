// src/utils/appStore.js
import { configureStore } from "@reduxjs/toolkit";
import user from "./userSlice";
import feed from "./feedSlice";
import requests from "./requestsSlice";
import connections from "./connectionsSlice";

export default configureStore({
  reducer: { user, feed, requests, connections },
});
