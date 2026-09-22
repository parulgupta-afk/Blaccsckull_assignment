const mongoose = require('mongoose');

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/feedants';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log('[db] connected to MongoDB');

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });
}

module.exports = { connectDB };
