/**
 * Production server setup
 * Serves the React build folder from Express so you can deploy
 * both frontend and backend as a single Node process.
 *
 * Usage: Add this to the bottom of server/index.js
 * (already wired up below — this file documents the changes needed)
 */

// Add this block to the BOTTOM of server/index.js, before the listen() call:

/*

const path = require('path');

if (process.env.NODE_ENV === 'production') {
  // Serve React build
  app.use(express.static(path.join(__dirname, '../client/build')));

  // For any route not matched by API, serve React's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

*/

// Build script (run from root):
// cd client && npm run build
// Then start server: cd server && node index.js

module.exports = {};
