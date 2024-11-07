const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: String, required: true },
  completed: { type: Boolean, default: false },
  tags: [{ type: String }],
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  }, // New field for priority
});

module.exports = mongoose.model("Todo", todoSchema);
