const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS to fix SRV lookup issues on restricted networks
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * Connect to MongoDB using the URI from environment variables.
 * Exits the process if connection fails.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
