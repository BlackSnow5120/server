const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // Use mongoose-sequence plugin

const commentSchema = new mongoose.Schema({
  commentText: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.plugin(AutoIncrement, { inc_field: 'cmid' });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;