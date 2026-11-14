const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_inventory';

  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
    
    // Connect with a 3-second serverSelectionTimeoutMS so server doesn't freeze if MongoDB is offline
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    isConnected = true;
    console.log('✅ [MongoDB] Successfully connected to MongoDB database.');
  } catch (error) {
    isConnected = false;
    console.warn('⚠️  [MongoDB Warning] Could not connect to MongoDB service on port 27017 or provided URI.');
    console.warn(`    Reason: ${error.message}`);
    console.log('💡 [Notice] Auto-activating embedded JSON Data Engine.');
    console.log('    All Product CRUD, Sales reductions, and Analytics will persist locally.');
    console.log('    To switch to live MongoDB later: start mongod or set MONGODB_URI in backend/.env.');
  }

  return isConnected;
};

const getStatus = () => ({
  connected: isConnected,
  mode: isConnected ? 'MongoDB / Mongoose' : 'Embedded JSON Persistence',
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_inventory'
});

module.exports = { connectDB, getStatus, isMongoConnected: () => isConnected };
