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

// Guards against the single most common mistake with this script: copying
// the literal placeholder from the docs (e.g. "<demo-user-id>") instead of
// substituting a real id printed by `npm run seed`.
if (userId.includes('<') || userId.includes('>')) {
  console.error(
    `"${userId}" looks like a placeholder, not a real user id.\n` +
      'Run `npm run seed` first, copy the id it prints, then re-run:\n' +
      '  npm run mint-token -- <the-real-id-from-seed>'
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Make sure backend/.env exists and has JWT_SECRET=...');
  process.exit(1);
}

const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET);
console.log('Paste this line into mobile/.env:');
console.log(`EXPO_PUBLIC_DEMO_AUTH_TOKEN=${token}`);
