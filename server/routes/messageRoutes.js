const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getPrivateMessages,
  getRoomMessages,
  uploadImage,
  markSeen,
  getUnreadCounts,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/send", protect, upload.single("image"), sendMessage);
router.get("/private/:userId", protect, getPrivateMessages);
router.get("/room/:roomId", protect, getRoomMessages);
router.post("/upload-image", protect, upload.single("image"), uploadImage);
router.put("/seen/:senderId", protect, markSeen);
router.get("/unread", protect, getUnreadCounts);

module.exports = router;
