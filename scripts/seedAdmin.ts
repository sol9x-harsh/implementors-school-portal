import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Missing MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD in .env.local");
  process.exit(1);
}

// Minimal User Schema to avoid Next.js specific path alias issues in standalone script
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log(`⚠️ Admin user with email ${ADMIN_EMAIL} already exists. Skipping.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD as string, 10);

    await User.create({
      name: "Super Admin",
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log(`✅ Successfully created Admin account for ${ADMIN_EMAIL}!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
