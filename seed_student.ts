import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in .env.local');

  await mongoose.connect(uri);
  
  const email = 'test.student@example.com';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const db = mongoose.connection.db;
  if (!db) throw new Error('DB connection failed');
  
  await db.collection('users').deleteOne({ email });
  await db.collection('users').insertOne({
    name: 'Test Student',
    email,
    password: hashedPassword,
    role: 'STUDENT',
    mobileNo: '9876543210',
    studentType: 'SCHOOL',
    classLevel: '12',
    stream: 'PCM',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('\n--- TEST STUDENT CREDENTIALS ---');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('--------------------------------\n');
  
  process.exit(0);
}

seed().catch(console.error);
