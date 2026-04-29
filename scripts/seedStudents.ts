import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env.local");
  process.exit(1);
}

// Schemas for seeding (Updated to match strict validation in User.ts)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  mobileNo: { type: String, required: true },
  institution: { type: String, required: true },
  studentType: { type: String, required: true },
  classLevel: { type: String, required: true },
  subjects: { type: [String], required: true },
  stream: { type: String, required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  fatherName: { type: String, required: true },
  fatherOccupation: { type: String, required: true },
  fatherMobile: { type: String, required: true },
  fatherEmail: { type: String, required: true },
  motherName: { type: String, required: true },
  motherOccupation: { type: String, required: true },
  motherMobile: { type: String, required: true },
  motherEmail: { type: String, required: true },
  linkedInId: { type: String },
  targetedExams: [{ type: String }],
  targetedInstitutions: [{ type: String }],
  targetedCountries: [{ type: String }],
  targetedCourses: [{ type: String }],
  otherTargets: [{ type: String }],
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  externalUrl: { type: String },
  eventDate: { type: Date },
  targetAudience: [{ type: String }],
});

const dataRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: Date },
  targetAudience: [{ type: String }],
  formSchema: { type: mongoose.Schema.Types.Mixed },
});

const gradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  term: { type: String, required: true },
  academicYear: { type: String, required: true },
  marks: { type: Map, of: Number, required: true },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
const DataRequest = mongoose.models.DataRequest || mongoose.model("DataRequest", dataRequestSchema);
const InternalGrade = mongoose.models.InternalGrade || mongoose.model("InternalGrade", gradeSchema);

async function seedStudents() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    // Clear existing data to avoid validation conflicts with old structure
    await User.deleteMany({ role: "STUDENT" });
    console.log("🧹 Cleared old student data");

    // 1. Create Students
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const students = [
      {
        name: "Jane Doe",
        email: "jane@school.edu",
        password: hashedPassword,
        role: "STUDENT",
        mobileNo: "+91 9876543210",
        institution: "Sol9x Academy",
        studentType: "SCHOOL",
        classLevel: "Class 12",
        subjects: ["Physics", "Chemistry", "Math"],
        stream: "Science",
        college: "N/A",
        course: "N/A",
        year: "N/A",
        fatherName: "Richard Doe",
        fatherOccupation: "Engineer",
        fatherMobile: "+91 9876543211",
        fatherEmail: "richard@example.com",
        motherName: "Mary Doe",
        motherOccupation: "Doctor",
        motherMobile: "+91 9876543212",
        motherEmail: "mary@example.com",
      },
      {
        name: "John Doe",
        email: "john@school.edu",
        password: hashedPassword,
        role: "STUDENT",
        mobileNo: "+91 9876543220",
        institution: "Sol9x College",
        studentType: "COLLEGE",
        classLevel: "N/A",
        subjects: ["N/A"],
        stream: "N/A",
        college: "Sol9x Tech",
        course: "B.Tech Computer Science",
        year: "3rd Year",
        fatherName: "William Doe",
        fatherOccupation: "Professor",
        fatherMobile: "+91 9876543221",
        fatherEmail: "william@example.com",
        motherName: "Sarah Doe",
        motherOccupation: "Architect",
        motherMobile: "+91 9876543222",
        motherEmail: "sarah@example.com",
      }
    ];

    for (const student of students) {
      const created = await User.create(student);
      console.log(`✅ Created student: ${student.name}`);
      
      // 2. Add some marks for the student
      await InternalGrade.create({
        studentId: created._id,
        term: "Term 1",
        academicYear: "2025-26",
        marks: {
          "Advanced Mathematics": 85,
          "Quantum Physics": 78,
          "Organic Chemistry": 92,
          "Computation Theory": 88,
          "Global Perspectives": 80
        }
      });
      console.log(`✅ Seeded marks for ${student.name}`);
    }

    // 3. Create some Events
    const events = [
      {
        title: "Regional Science Hackathon 2026",
        description: "A high-impact competitive event for science enthusiasts.",
        eventDate: new Date("2026-10-15"),
        targetAudience: ["GLOBAL", "Science"],
      },
      {
        title: "National Mathematics Olympiad",
        description: "Annual academic competition for mathematics.",
        eventDate: new Date("2026-11-02"),
        targetAudience: ["GLOBAL"],
      }
    ];

    for (const ev of events) {
      const existing = await Event.findOne({ title: ev.title });
      if (!existing) {
        await Event.create(ev);
        console.log(`✅ Created event: ${ev.title}`);
      }
    }

    // 4. Create a Data Request (Form)
    const dataRequest = {
      title: "Upload JEE Mains Scorecard",
      deadline: new Date("2026-10-30"),
      targetAudience: ["Class 12"],
      formSchema: {
        fields: [
          { id: "field_1", label: "JEE Mains Percentile", type: "number" },
          { id: "field_2", label: "Official Scorecard (PDF)", type: "file" },
        ]
      }
    };

    const existingRequest = await DataRequest.findOne({ title: dataRequest.title });
    if (!existingRequest) {
      await DataRequest.create(dataRequest);
      console.log(`✅ Created data request: ${dataRequest.title}`);
    }

    console.log("🏁 Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding students:", error);
    process.exit(1);
  }
}

seedStudents();
