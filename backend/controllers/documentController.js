const Document = require('../models/Document');
const User = require("../models/User")

// Create a new document
const createDocument = async (req, res) => {
  const { title, language, content } = req.body;
  try {
    const newDoc = await Document.create({
      title,
      language,
      content,
      owner: req.user._id,
    });
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ message: "Failed to create document", error: err.message });
  }
};

// Get all documents of logged-in user
const getAllDocuments = async (req, res) => {
  try {
    const ownedDocuments = await Document.find({ owner: req.user._id });
    const sharedDocuments = await Document.find({ sharedWith: req.user._id });

    res.json({ ownedDocuments, sharedDocuments });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch documents", error: err.message });
  }
};

// Get a single document by ID (only if owner)
const getDocumentById = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await Document.findOne({
      _id: id,
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id }
      ]
    })
    .populate("owner", "name email")             // Get owner details
    .populate("sharedWith", "name email");       // Get shared users' details;
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch document", error: err.message });
  }
};

// Update a document 
const updateDocument = async (req, res) => {
  const { id } = req.params;
  const { title, language, content } = req.body;

  try {
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (language !== undefined) updateFields.language = language;
    if (content !== undefined) updateFields.content = content;

    const updatedDoc = await Document.findOneAndUpdate(
      {
        _id: id,
        $or: [
          { owner: req.user._id },
          { sharedWith: req.user._id }
        ]
      },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: "Document not found or unauthorized" });
    }

    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ message: "Failed to update document", error: err.message });
  }
};


// Delete a document
const deleteDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Document.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Document not found or unauthorized" });
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete document", error: err.message });
  }
};

const shareDocument = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const doc = await Document.findOne({ _id: id, owner: req.user._id });
    if (!doc) return res.status(403).json({ message: "Not authorized to share this document." });
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist." });
    }

    if (doc.owner.toString()===user._id.toString() || doc.sharedWith.some(id => id.toString() === user._id.toString())) {
      return res.status(400).json({ message: "This email already has access to the document." });
    }

    doc.sharedWith.push(user._id);
    await doc.save();
    res.json({ message: "Document shared successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error sharing document", error: err.message });
  }
};


module.exports = {
  createDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  shareDocument,
};
