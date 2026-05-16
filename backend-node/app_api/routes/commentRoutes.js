const { Router } = require('express');
const { listByPlayer, create, remove } = require('../controllers/commentsController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.get('/player/:playerId', listByPlayer);
router.post('/player/:playerId', create);
router.delete('/:id', authenticate, requireRole('admin'), remove);

module.exports = router;
