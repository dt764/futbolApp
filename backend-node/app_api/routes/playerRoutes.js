const { Router } = require('express');
const { list, getById, searchExternal, importFromApi, create, update, remove } = require('../controllers/playersController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.get('/', list);
router.get('/search/external', authenticate, searchExternal);
router.post('/manual', authenticate, create);
router.post('/import', authenticate, importFromApi);
router.put('/:id', authenticate, requireRole('admin'), update);
router.delete('/:id', authenticate, requireRole('admin'), remove);
router.get('/:id', getById);

module.exports = router;
