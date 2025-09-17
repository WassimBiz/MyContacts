const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

function loadEnv() {
  const envDir = path.resolve(__dirname, '..');
  const envTest = path.join(envDir, '.env.test');
  const envDefault = path.join(envDir, '.env');
  if (fs.existsSync(envTest)) dotenv.config({ path: envTest });
  else dotenv.config({ path: envDefault });
}

function deriveTestUriFromMongoUri(mongoUri) {
  try {
    const u = new URL(mongoUri);
    u.pathname = '/mycontacts_test';
    return u.toString();
  } catch {
    if (!mongoUri.includes('/')) return mongoUri + '/mycontacts_test';
    if (mongoUri.includes('?')) {
      const [base, q] = mongoUri.split('?');
      const baseNoDb = base.replace(/(mongodb\+srv:\/\/[^/]+)(?:\/[^?]*)?/, '$1');
      return `${baseNoDb}/mycontacts_test?${q}`;
    }
    const baseNoDb = mongoUri.replace(/(mongodb\+srv:\/\/[^/]+)(?:\/.*)?$/, '$1');
    return `${baseNoDb}/mycontacts_test`;
  }
}

loadEnv();
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'supersecret123';

let uri = process.env.TEST_MONGO_URI;
if (!uri) {
  if (!process.env.MONGO_URI) throw new Error('TEST_MONGO_URI missing and MONGO_URI not set');
  uri = deriveTestUriFromMongoUri(process.env.MONGO_URI);
  process.env.TEST_MONGO_URI = uri;
  console.log('[tests] Derived TEST_MONGO_URI from MONGO_URI');
} else {
  console.log('[tests] Using Atlas TEST_MONGO_URI');
}

beforeAll(async () => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    family: 4, // force IPv4 (évite certains soucis Windows/Atlas)
  });
  // DB propre pour des tests déterministes
  try { await mongoose.connection.dropDatabase(); } catch {}
});

afterAll(async () => {
  try { await mongoose.connection.dropDatabase(); } catch {}
  try { await mongoose.disconnect(); } catch {}
});
