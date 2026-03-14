const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  category: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  status: {
    type: String,
    enum: ["new", "accepted", "completed", "failed"],
    default: "new"
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);