import mongoose from 'mongoose'; // Ensure mongoose is imported
import { connectToDatabase } from '../../../lib/mongodb';
import Comment from '../../../models/Comment';

// Helper function to connect to MongoDB
const connect = async () => {
  if (mongoose.connections[0].readyState) {
    return; // already connected
  }
  await connectToDatabase();
};

// POST: Add a new comment
export const addComment = async (req, res) => {
  try {
    const { commentText, userName, skill } = req.body;
    const comment = new Comment({ commentText, userName, skill });
    await comment.save();
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET: Get all comments
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET: Get comment by ID
export const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.query.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT: Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentText, userName, skill } = req.body;
    const comment = await Comment.findByIdAndUpdate(
      req.query.id,
      { commentText, userName, skill },
      { new: true, runValidators: true }
    );
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE: Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.query.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Default export handler for the API route
export default async function handler(req, res) {
  await connect();  // Connect to the database

  switch (req.method) {
    case 'POST':
      return addComment(req, res);
    case 'GET':
      if (req.query.id) {
        return getCommentById(req, res);
      } else {
        return getAllComments(req, res);
      }
    case 'PUT':
      return updateComment(req, res);
    case 'DELETE':
      return deleteComment(req, res);
    default:
      res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
