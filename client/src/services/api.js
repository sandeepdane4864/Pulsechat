import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: false,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = localStorage.getItem("pulse_user");
  if (user) {
    const { token } = JSON.parse(user);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("pulse_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const logoutUser = () => API.post("/auth/logout");
export const getProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);
export const getAllUsers = () => API.get("/auth/users");

// ─── Messages ────────────────────────────────────
export const sendMessage = (data) => API.post("/messages/send", data);
export const getPrivateMessages = (userId) =>
  API.get(`/messages/private/${userId}`);
export const getRoomMessages = (roomId) =>
  API.get(`/messages/room/${roomId}`);
export const uploadImage = (data) => API.post("/messages/upload-image", data);
export const markMessagesSeen = (senderId) =>
  API.put(`/messages/seen/${senderId}`);
export const getUnreadCounts = () => API.get("/messages/unread");

// ─── Rooms ────────────────────────────────────────
export const createRoom = (data) => API.post("/rooms/create", data);
export const getAllRooms = () => API.get("/rooms/all");
export const getMyRooms = () => API.get("/rooms/my");
export const getRoom = (roomId) => API.get(`/rooms/${roomId}`);
export const joinRoom = (roomId) => API.post("/rooms/join", { roomId });
export const leaveRoom = (roomId) => API.delete("/rooms/leave", { data: { roomId } });
export const deleteRoom = (roomId) => API.delete(`/rooms/${roomId}`);

export default API;
