const express = require("express");
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  getMyRooms,
  getRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
} = require("../controllers/roomController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/create", protect, upload.single("roomImage"), createRoom);
router.get("/all", protect, getAllRooms);
router.get("/my", protect, getMyRooms);
router.get("/:roomId", protect, getRoom);
router.post("/join", protect, joinRoom);
router.delete("/leave", protect, leaveRoom);
router.delete("/:roomId", protect, deleteRoom);

module.exports = router;
