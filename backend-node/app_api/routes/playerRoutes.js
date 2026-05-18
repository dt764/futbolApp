const { Router } = require('express');
const { list, getById, searchExternal, importFromApi, create, update, remove } = require('../controllers/playersController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

/**
 * @swagger
 * /api/players:
 *   get:
 *     tags: [Jugadores]
 *     summary: Listar jugadores (público)
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Filtrar por nombre
 *       - in: query
 *         name: team
 *         schema: { type: string }
 *         description: Filtrar por equipo
 *       - in: query
 *         name: league
 *         schema: { type: string }
 *         description: Filtrar por liga
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Resultados por página
 *     responses:
 *       200:
 *         description: Lista de jugadores paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 pages: { type: integer }
 */
router.get('/', list);

/**
 * @swagger
 * /api/players/search/external:
 *   get:
 *     tags: [Jugadores]
 *     summary: Buscar jugadores en API externa (autenticado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *         description: Nombre del jugador
 *       - in: query
 *         name: team
 *         schema: { type: string }
 *         description: Equipo (nombre o ID numérico)
 *       - in: query
 *         name: league
 *         schema: { type: string }
 *         description: Liga (nombre o ID numérico)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Resultados de la API externa
 *       401:
 *         description: No autenticado
 *       502:
 *         description: Error al contactar API externa
 */
router.get('/search/external', authenticate, searchExternal);

/**
 * @swagger
 * /api/players/manual:
 *   post:
 *     tags: [Jugadores]
 *     summary: Crear jugador manualmente (autenticado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               firstname: { type: string }
 *               lastname: { type: string }
 *               nationality: { type: string }
 *               position: { type: string }
 *               birthDate: { type: string }
 *               height: { type: string }
 *               weight: { type: string }
 *               photo: { type: string, description: URL de la imagen }
 *               team: { type: string }
 *               league: { type: string }
 *               location:
 *                 type: object
 *                 properties:
 *                   lat: { type: number }
 *                   lng: { type: number }
 *                   address: { type: string }
 *     responses:
 *       201:
 *         description: Jugador creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Nombre obligatorio
 *       401:
 *         description: No autenticado
 */
router.post('/manual', authenticate, create);

/**
 * @swagger
 * /api/players/import:
 *   post:
 *     tags: [Jugadores]
 *     summary: Importar jugador desde API externa (autenticado)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [player, statistics]
 *             properties:
 *               player:
 *                 type: object
 *                 description: Objeto player de la respuesta de API-Football
 *               statistics:
 *                 type: array
 *                 description: Array statistics de la respuesta de API-Football
 *               team: { type: string }
 *               league: { type: string }
 *               location:
 *                 type: object
 *                 properties:
 *                   lat: { type: number }
 *                   lng: { type: number }
 *     responses:
 *       201:
 *         description: Jugador importado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       409:
 *         description: El jugador ya existe
 */
router.post('/import', authenticate, importFromApi);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     tags: [Jugadores]
 *     summary: Actualizar jugador (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: Jugador actualizado
 *       403:
 *         description: No autorizado (admin)
 *       404:
 *         description: No encontrado
 */
router.put('/:id', authenticate, requireRole('admin'), update);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     tags: [Jugadores]
 *     summary: Eliminar jugador (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Jugador eliminado
 *       403:
 *         description: No autorizado (admin)
 *       404:
 *         description: No encontrado
 */
router.delete('/:id', authenticate, requireRole('admin'), remove);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     tags: [Jugadores]
 *     summary: Obtener jugador por ID (público)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Datos del jugador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: No encontrado
 */
router.get('/:id', getById);

module.exports = router;
