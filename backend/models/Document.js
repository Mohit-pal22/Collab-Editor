const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Untitled",
    },
    language: {
      type: String,
      default: "javascript", // default language
    },
    content: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
  },
  { timestamps: true } // adds createdAt and updatedAt
);

module.exports = mongoose.model("Document", documentSchema);
