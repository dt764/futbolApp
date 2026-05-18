const { Router } = require('express');
const { generate } = require('../controllers/idealTeamController');
const { authenticate } = require('../middleware/auth');

const router = Router();

/**
 * @swagger
 * /api/ideal-team:
 *   post:
 *     tags: [Equipo Ideal]
 *     summary: Generar equipo ideal con Groq (autenticado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formation:
 *                 type: string
 *                 example: "4-3-3"
 *                 description: Formación táctica (opcional)
 *               source:
 *                 type: string
 *                 enum: [database, fantasy]
 *                 default: database
 *                 description: "database=jugadores en BD, fantasy=jugadores predefinidos"
 *     responses:
 *       200:
 *         description: Equipo ideal generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team:
 *                   $ref: '#/components/schemas/IdealTeam'
 *                 source:
 *                   type: string
 *       400:
 *         description: Menos de 11 jugadores en BD
 *       401:
 *         description: No autenticado
 *       502:
 *         description: Error al contactar con Groq
 */
router.post('/', authenticate, generate);

module.exports = router;
