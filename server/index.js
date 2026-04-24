require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');

require('./middleware/passport');

const authRoutes = require('./routes/auth');
const galaxyRoutes = require('./routes/galaxy');
const userRoutes = require('./routes/user');
const webhookRoutes = require('./routes/webhook');
const exploreRoutes = require('./routes/explore');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'galaxy-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/galaxy', galaxyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/webhooks', webhookRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Galaxy server is alive 🌌' }));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/github-galaxy')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 8080, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 8080}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
