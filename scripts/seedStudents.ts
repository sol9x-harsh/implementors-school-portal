import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in .env.local');
  process.exit(1);
}

// Schemas for seeding (Updated to match Student model)
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    mobileNo: { type: String, required: true },
    institution: { type: String },
    uid: { type: String, unique: true, sparse: true },
    classLevel: { type: String },
    stream: { type: String },
    subjects: [{ type: String }],
    fatherName: { type: String },
    fatherOccupation: { type: String },
    fatherMobile: { type: String },
    fatherEmail: { type: String },
    motherName: { type: String },
    motherOccupation: { type: String },
    motherMobile: { type: String },
    motherEmail: { type: String },
    targetedExams: [{ type: String }],
    targetedInstitutions: [{ type: String }],
    targetedCountries: [{ type: String }],
    targetedCourses: [{ type: String }],
    otherTargets: [{ type: String }],
  },
  { timestamps: true },
);

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
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  term: { type: String, required: true },
  academicYear: { type: String, required: true },
  marks: { type: Map, of: Number, required: true },
});

const Student =
  mongoose.models.Student || mongoose.model('Student', studentSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
const DataRequest =
  mongoose.models.DataRequest ||
  mongoose.model('DataRequest', dataRequestSchema);
const InternalGrade =
  mongoose.models.InternalGrade || mongoose.model('InternalGrade', gradeSchema);

async function seedStudents() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');

    // Clear existing data to avoid validation conflicts with old structure
    await Student.deleteMany({});
    console.log('🧹 Cleared old student data');

    // 1. Create Students
    const hashedPassword = await bcrypt.hash('password123', 10);

    const students = [
      {
        name: 'John Doe',
        email: 'john@school.edu',
        password: hashedPassword,
        mobileNo: '+91 9876543210',
        institution: 'SOL9X School',
        classLevel: 'Class 11',
        subjects: [
          'Mathematics',
          'Accountancy',
          'Business Studies',
          'Economics',
        ],
        stream: 'Commerce',
        fatherName: 'Robert Doe',
        fatherOccupation: 'Businessman',
        fatherMobile: '+91 9876543211',
        fatherEmail: 'robert@example.com',
        motherName: 'Jennifer Doe',
        motherOccupation: 'Teacher',
        motherMobile: '+91 9876543212',
        motherEmail: 'jennifer@example.com',
      },
      {
        name: 'Jane Doe',
        email: 'jane@school.edu',
        password: hashedPassword,
        mobileNo: '+91 9876543220',
        institution: 'SOL9X School',
        classLevel: 'Class 12',
        subjects: ['Physics', 'Chemistry', 'Biology'],
        stream: 'Science',
        fatherName: 'Michael Doe',
        fatherOccupation: 'Doctor',
        fatherMobile: '+91 9876543221',
        fatherEmail: 'michael@example.com',
        motherName: 'Elizabeth Doe',
        motherOccupation: 'Nurse',
        motherMobile: '+91 9876543222',
        motherEmail: 'elizabeth@example.com',
      },
    ];

    for (const student of students) {
      const created = await Student.create(student);
      console.log(`✅ Created student: ${student.name}`);

      // 2. Add some marks for the student
      let marks;
      if (student.name === 'John Doe') {
        // Commerce student marks
        marks = {
          Mathematics: 88,
          Accountancy: 85,
          'Business Studies': 82,
          Economics: 87,
          English: 90,
        };
      } else {
        // PCB student marks
        marks = {
          Physics: 86,
          Chemistry: 84,
          Biology: 89,
          Mathematics: 85,
          English: 91,
        };
      }

      await InternalGrade.create({
        studentId: created._id,
        term: 'Term 1',
        academicYear: '2025-26',
        marks: marks,
      });
      console.log(`✅ Seeded marks for ${student.name}`);
    }

    // 3. Create some Events
    const events = [
      {
        title: 'Regional Science Hackathon 2026',
        description: 'A high-impact competitive event for science enthusiasts.',
        eventDate: new Date('2026-10-15'),
        targetAudience: ['GLOBAL', 'Science'],
      },
      {
        title: 'National Mathematics Olympiad',
        description: 'Annual academic competition for mathematics.',
        eventDate: new Date('2026-11-02'),
        targetAudience: ['GLOBAL'],
      },
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
      title: 'Upload JEE Mains Scorecard',
      deadline: new Date('2026-10-30'),
      targetAudience: ['Class 12'],
      formSchema: {
        fields: [
          { id: 'field_1', label: 'JEE Mains Percentile', type: 'number' },
          { id: 'field_2', label: 'Official Scorecard (PDF)', type: 'file' },
        ],
      },
    };

    const existingRequest = await DataRequest.findOne({
      title: dataRequest.title,
    });
    if (!existingRequest) {
      await DataRequest.create(dataRequest);
      console.log(`✅ Created data request: ${dataRequest.title}`);
    }

    console.log('🏁 Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    process.exit(1);
  }
}

seedStudents();
