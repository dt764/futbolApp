// models/Player.js
const { Schema, model } = require('mongoose');

const playerSchema = new Schema({

  source: {
    type: String,
    enum: ['api', 'manual'],
    required: true
  },

  apiId: {
    type: Number,
    sparse: true,
    unique: true
  },

  name: { type: String, required: true },
  firstname: String,
  lastname: String,
  nationality: String,
  position: String,
  birthDate: String,
  birthPlace: String,
  birthCountry: String,
  height: String,
  weight: String,
  photo: String,

  // Introducidos por el usuario al importar o en formulario manual
  team: String,
  league: String,

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },

  createdBy: {
    type: String,  // uid de Firebase
    required: true
  }

}, { timestamps: true });

module.exports = model('Player', playerSchema);
