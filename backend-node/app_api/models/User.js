// models/User.js
const { Schema, model } = require('mongoose');

const userSchema = new Schema({

  uid: {
    type: String,  // uid de Firebase
    required: true,
    unique: true
  },
  email: String,
  displayName: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }

}, { timestamps: true });

module.exports = model('User', userSchema);