import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  // Base Identity & Auth (REQUIRED)
  name: string;
  email: string;
  password?: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  mobileNo: string;
  institution?: string;
  studentType?: 'SCHOOL' | 'COLLEGE' | 'ADMIN';

  // Academic Details (Student-only)
  classLevel?: string;
  subjects?: string[];
  stream?: string;
  college?: string;
  course?: string;
  year?: string;

  // Parent Details (Student-only)
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobile?: string;
  fatherEmail?: string;
  motherName?: string;
  motherOccupation?: string;
  motherMobile?: string;
  motherEmail?: string;

  // Targets & Social (OPTIONAL)
  linkedInId?: string;
  targetedExams?: string[];
  targetedInstitutions?: string[];
  targetedCountries?: string[];
  targetedCourses?: string[];
  otherTargets?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    // Base Identity & Auth
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { 
      type: String, 
      enum: ['STUDENT', 'ADMIN', 'SUPER_ADMIN'], 
      default: 'STUDENT',
      required: true 
    },
    mobileNo: { type: String, required: true },
    institution: { type: String },
    studentType: { 
      type: String, 
      enum: ['SCHOOL', 'COLLEGE', 'ADMIN'],
    },

    // Academic Details (optional for admin users)
    classLevel: { type: String },
    subjects: { type: [String] },
    stream: { type: String },
    college: { type: String },
    course: { type: String },
    year: { type: String },

    // Parent Details (optional for admin users)
    fatherName: { type: String },
    fatherOccupation: { type: String },
    fatherMobile: { type: String },
    fatherEmail: { type: String },
    motherName: { type: String },
    motherOccupation: { type: String },
    motherMobile: { type: String },
    motherEmail: { type: String },

    // Targets & Social (OPTIONAL)
    linkedInId: { type: String },
    targetedExams: [{ type: String }],
    targetedInstitutions: [{ type: String }],
    targetedCountries: [{ type: String }],
    targetedCourses: [{ type: String }],
    otherTargets: [{ type: String }],
  },
  { timestamps: true }
);

// Prevent mongoose from recompiling the model upon hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
