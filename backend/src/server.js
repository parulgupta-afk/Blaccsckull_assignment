const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createApp } = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedants';

(async () => {
  try {
    await connectDB(MONGO_URI);
    const app = createApp();
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('[server] failed to start:', err);
    process.exit(1);
  }
})();
