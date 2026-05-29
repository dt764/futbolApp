const { Router } = require('express');
const { login, me, updateMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Autenticación]
 *     summary: Iniciar sesión (con idToken o email+password)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             oneOf:
 *               - required: [idToken]
 *                 properties:
 *                   idToken:
 *                     type: string
 *                     description: Token de ID de Firebase
 *               - required: [email, password]
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                   password:
 *                     type: string
 *     responses:
 *       200:
 *         description: Usuario autenticado (devuelve token + user)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Faltan credenciales
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Autenticación]
 *     summary: Obtener usuario actual
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 */
router.get('/me', authenticate, me);
router.put('/me', authenticate, updateMe);

module.exports = router;
