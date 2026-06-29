const path = require('path');
const os = require('os');

// Vercel's serverless filesystem is read-only except /tmp, and process.env.VERCEL
// is set automatically in that environment. Locally (and on traditional hosts),
// fall back to a project-relative folder so uploaded files survive restarts.
const recipesDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads', 'recipes')
  : path.join(__dirname, '../../uploads/recipes');

module.exports = { recipesDir };
