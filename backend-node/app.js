const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./app_api/routes/authRoutes');
const playerRoutes = require('./app_api/routes/playerRoutes');
const commentRoutes = require('./app_api/routes/commentRoutes');
const idealTeamRoutes = require('./app_api/routes/idealTeamRoutes');
const { generateSpec } = require('./app_api/config/swagger');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/api-docs/swagger.json', (req, res) => {
  const protocol = req.get('X-Forwarded-Proto') || req.protocol;
  const host = req.get('X-Forwarded-Host') || req.get('host');
  res.json(generateSpec(`${protocol}://${host}`));
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: { url: '/api-docs/swagger.json' },
}));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ideal-team', idealTeamRoutes);

module.exports = app;

