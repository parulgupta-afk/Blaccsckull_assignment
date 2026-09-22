// Usage:
//   node scripts/mintToken.js <userId>
//
// Prints a JWT signed with JWT_SECRET from your .env, for testing endpoints
// that require Authorization: Bearer <token>. Avoids shell-quoting headaches
// on Windows (PowerShell/cmd) that `node -e "..."` one-liners run into.

require('dotenv').config();
const jwt = require('jsonwebtoken');

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/mintToken.js <userId>');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Make sure backend/.env exists and has JWT_SECRET=...');
  process.exit(1);
}

const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET);
console.log(token);
