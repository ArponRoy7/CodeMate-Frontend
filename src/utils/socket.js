import { io } from "socket.io-client";
import { pickSocketUrl } from "./constants";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(pickSocketUrl(), {
      withCredentials: true,
      path: "/socket.io", // must match server
      // transports: ["websocket"], // optional, fallback to polling if AWS LB blocks ws upgrade
    });
  }
  return socket;
};
