const { Router } = require('express');
const { listByPlayer, create, remove } = require('../controllers/commentsController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

/**
 * @swagger
 * /api/comments/player/{playerId}:
 *   get:
 *     tags: [Comentarios]
 *     summary: Listar comentarios de un jugador (público)
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 averageRating: { type: number }
 */
router.get('/player/:playerId', listByPlayer);

/**
 * @swagger
 * /api/comments/player/{playerId}:
 *   post:
 *     tags: [Comentarios]
 *     summary: Añadir comentario a un jugador (público)
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [author, text, rating]
 *             properties:
 *               author: { type: string }
 *               text: { type: string, maxLength: 1000 }
 *               rating: { type: number, minimum: 0, maximum: 5 }
 *               location:
 *                 type: object
 *                 properties:
 *                   lat: { type: number }
 *                   lng: { type: number }
 *     responses:
 *       201:
 *         description: Comentario creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/player/:playerId', create);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     tags: [Comentarios]
 *     summary: Eliminar comentario (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Comentario eliminado
 *       403:
 *         description: No autorizado (admin)
 *       404:
 *         description: No encontrado
 */
router.delete('/:id', authenticate, requireRole('admin'), remove);

module.exports = router;
