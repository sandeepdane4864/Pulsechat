const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    message: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
  },
  { timestamps: true }
);

// Ensure at least message or image is provided
messageSchema.pre("save", function (next) {
  if (!this.message && !this.image) {
    return next(new Error("Message must have text or image"));
  }
  next();
});

module.exports = mongoose.model("Message", messageSchema);
