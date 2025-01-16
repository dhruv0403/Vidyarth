const crypto = require('crypto');

// Utility: Generate a unique license ID
const generateUniqueLicenseId = () => {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
};

module.exports = { generateUniqueLicenseId };
