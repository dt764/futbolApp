// models/Comment.js
const { Schema, model } = require('mongoose');

const commentSchema = new Schema({

  player: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  author: {
    type: String,  // texto libre, no requiere login
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }

}, { timestamps: true });

module.exports = model('Comment', commentSchema);