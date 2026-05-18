const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./app_api/routes/authRoutes');
const playerRoutes = require('./app_api/routes/playerRoutes');
const commentRoutes = require('./app_api/routes/commentRoutes');
const idealTeamRoutes = require('./app_api/routes/idealTeamRoutes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

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

