import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    });
    console.log('✅ Connection successful!');
    console.log('Database:', mongoose.connection.db.databaseName);
    console.log('Host:', mongoose.connection.host);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nError details:');
    console.error('- Error name:', error.name);
    console.error('- Error code:', error.code);
    
    if (error.message.includes('ETIMEOUT') || error.message.includes('querySrv')) {
      console.error('\n🔍 DNS/Network Issue Detected (querySrv ETIMEOUT):');
      console.error('This means the system cannot resolve the MongoDB Atlas DNS.');
      console.error('\nPossible causes and solutions:');
      console.error('1. MongoDB Atlas cluster is PAUSED');
      console.error('   → Go to https://cloud.mongodb.com');
      console.error('   → Select your cluster and click "Resume"');
      console.error('   → Wait 1-2 minutes for it to start');
      console.error('\n2. Network Access not configured');
      console.error('   → Atlas → Network Access → Add IP Address');
      console.error('   → Click "Allow Access from Anywhere" (0.0.0.0/0)');
      console.error('   → Wait 1-2 minutes for changes to apply');
      console.error('\n3. DNS/Firewall blocking');
      console.error('   → Try using a mobile hotspot');
      console.error('   → Disable VPN if using one');
      console.error('   → Check if your network blocks MongoDB ports');
      console.error('\n4. Internet connection issues');
      console.error('   → Check your internet connection');
      console.error('   → Try pinging: qm.jo9zpcz.mongodb.net');
    } else if (error.message.includes('authentication')) {
      console.error('\n🔍 Authentication Issue:');
      console.error('Check username and password in .env file');
      console.error('Current user: bashirkashaf123');
      console.error('Make sure the password matches what you set in MongoDB Atlas');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n🔍 Connection Refused:');
      console.error('Check Network Access settings in MongoDB Atlas');
      console.error('Ensure 0.0.0.0/0 is allowed');
    }
    
    process.exit(1);
  }
}

testConnection();
