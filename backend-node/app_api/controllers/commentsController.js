const Comment = require('../models/Comment');
const logger = require('../utils/logger');

const listByPlayer = async (req, res) => {
  try {
    logger.info('List comments by player', { playerId: req.params.playerId });

    const comments = await Comment.find({ player: req.params.playerId })
      .sort({ createdAt: -1 });

    logger.info('Comments fetched', { playerId: req.params.playerId, count: comments.length });

    res.json({ comments });
  } catch (err) {
    if (err.name === 'CastError') {
      logger.warn('List comments — invalid playerId', { playerId: req.params.playerId });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    logger.error('Error al obtener comentarios', { playerId: req.params.playerId, error: err.message });
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

const create = async (req, res) => {
  try {
    const { author, text, rating, location } = req.body;

    if (!author || !text || rating === undefined) {
      logger.warn('Create comment — missing fields', { author, text, rating });
      return res.status(400).json({ error: 'author, text y rating son obligatorios' });
    }

    if (text.length > 1000) {
      logger.warn('Create comment — text too long', { length: text.length });
      return res.status(400).json({ error: 'El comentario no puede exceder 1000 caracteres' });
    }

    if (rating < 0 || rating > 5) {
      logger.warn('Create comment — invalid rating', { rating });
      return res.status(400).json({ error: 'La valoración debe estar entre 0 y 5' });
    }

    logger.info('Creating comment', { playerId: req.params.playerId, author, rating });

    const comment = await Comment.create({
      player: req.params.playerId,
      author,
      text,
      rating,
      location: location || { lat: 0, lng: 0 },
    });

    logger.info('Comment created', { commentId: comment._id, playerId: req.params.playerId });
    res.status(201).json({ comment });
  } catch (err) {
    if (err.name === 'CastError') {
      logger.warn('Create comment — invalid playerId', { playerId: req.params.playerId });
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }
    logger.error('Error al crear el comentario', { playerId: req.params.playerId, error: err.message });
    res.status(500).json({ error: 'Error al crear el comentario' });
  }
};

const remove = async (req, res) => {
  try {
    logger.info('Remove comment', { commentId: req.params.id });

    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) {
      logger.warn('Remove comment — not found', { commentId: req.params.id });
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    logger.info('Comment removed', { commentId: req.params.id });
    res.json({ message: 'Comentario eliminado correctamente' });
  } catch (err) {
    if (err.name === 'CastError') {
      logger.warn('Remove comment — invalid id', { commentId: req.params.id });
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }
    logger.error('Error al eliminar el comentario', { commentId: req.params.id, error: err.message });
    res.status(500).json({ error: 'Error al eliminar el comentario' });
  }
};

module.exports = { listByPlayer, create, remove };
