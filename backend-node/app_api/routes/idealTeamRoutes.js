const { Router } = require('express');
const { generate } = require('../controllers/idealTeamController');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/', authenticate, generate);

module.exports = router;
