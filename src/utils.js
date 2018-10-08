const path = require('path');
const os = require('os');

// Resolves the home tilde.
function resolveHome(filepath) {
  if (path == null || !filepath) {
    return ""
  }

  if (filepath[0] === '~') {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath
}

module.exports = {
  resolveHome
}

