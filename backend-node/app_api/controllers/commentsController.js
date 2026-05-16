const Comment = require('../models/Comment');

const listByPlayer = async (req, res) => {
  try {
    const comments = await Comment.find({ player: req.params.playerId })
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

const create = async (req, res) => {
  try {
    const { author, text, rating, location } = req.body;

    if (!author || !text || rating === undefined) {
      return res.status(400).json({ error: 'author, text y rating son obligatorios' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'El comentario no puede exceder 1000 caracteres' });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'La valoración debe estar entre 0 y 5' });
    }

    const comment = await Comment.create({
      player: req.params.playerId,
      author,
      text,
      rating,
      location: location || { lat: 0, lng: 0 },
    });

    res.status(201).json({ comment });
  } catch {
    res.status(500).json({ error: 'Error al crear el comentario' });
  }
};

const remove = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    res.json({ message: 'Comentario eliminado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar el comentario' });
  }
};

module.exports = { listByPlayer, create, remove };
