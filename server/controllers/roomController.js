const Room = require("../models/Room");
const User = require("../models/User");

// @desc    Create a room
// @route   POST /api/rooms/create
const createRoom = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const room = await Room.create({
      name,
      description: description || "",
      admin: req.user._id,
      members: [req.user._id],
      isPrivate: isPrivate || false,
      roomImage: req.file ? `/uploads/${req.file.filename}` : "",
    });

    // Add room to user's rooms
    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms: room._id },
    });

    const populated = await room.populate("admin members", "name avatar status");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all public rooms
// @route   GET /api/rooms/all
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false })
      .populate("admin", "name avatar")
      .populate("members", "name avatar status")
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get rooms the user is a member of
// @route   GET /api/rooms/my
const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate("admin", "name avatar")
      .populate("members", "name avatar status")
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:roomId
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate("admin", "name avatar status")
      .populate("members", "name avatar status");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/join
const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    room.members.push(req.user._id);
    await room.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { rooms: room._id },
    });

    const populated = await room.populate("admin members", "name avatar status");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave a room
// @route   DELETE /api/rooms/leave
const leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Admin cannot leave — must delete or transfer
    if (room.admin.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Admin cannot leave. Delete the room instead." });
    }

    room.members = room.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await room.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { rooms: room._id },
    });

    res.json({ message: "Left room successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a room (admin only)
// @route   DELETE /api/rooms/:roomId
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (room.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can delete room" });
    }

    // Remove room from all members
    await User.updateMany(
      { rooms: room._id },
      { $pull: { rooms: room._id } }
    );

    await room.deleteOne();

    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getMyRooms,
  getRoom,
  joinRoom,
  leaveRoom,
  deleteRoom,
};
