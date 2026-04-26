const Message = require("../models/Message");
const User = require("../models/User");

// @desc    Send a private message
// @route   POST /api/messages/send
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, room } = req.body;

    if (!message && !req.file) {
      return res.status(400).json({ message: "Message or image required" });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId || null,
      room: room || null,
      message: message || "",
      image: req.file ? `/uploads/${req.file.filename}` : "",
      messageType: req.file ? "image" : "text",
    });

    const populated = await newMessage.populate(
      "sender",
      "name avatar status"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get private conversation between two users
// @route   GET /api/messages/private/:userId
const getPrivateMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .populate("sender", "name avatar status")
      .populate("receiver", "name avatar status")
      .sort({ createdAt: 1 });

    // Mark messages as seen
    await Message.updateMany(
      { sender: userId, receiver: myId, seen: false },
      { seen: true, seenAt: Date.now() }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get room messages
// @route   GET /api/messages/room/:roomId
const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ room: roomId })
      .populate("sender", "name avatar status")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload image for chat
// @route   POST /api/messages/upload-image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    res.json({
      imageUrl: `/uploads/${req.file.filename}`,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as seen
// @route   PUT /api/messages/seen/:senderId
const markSeen = async (req, res) => {
  try {
    await Message.updateMany(
      {
        sender: req.params.senderId,
        receiver: req.user._id,
        seen: false,
      },
      { seen: true, seenAt: Date.now() }
    );
    res.json({ message: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread message counts per user
// @route   GET /api/messages/unread
const getUnreadCounts = async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          seen: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(counts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getPrivateMessages,
  getRoomMessages,
  uploadImage,
  markSeen,
  getUnreadCounts,
};
