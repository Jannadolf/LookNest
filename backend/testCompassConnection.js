const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('No MONGODB_URI found in .env');
  process.exit(1);
}

console.log('Testing MongoDB connection to:', uri.split('@')[1] || uri);

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully');
    return mongoose.connection.close();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });
