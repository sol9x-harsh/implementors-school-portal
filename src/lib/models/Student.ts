import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  password?: string;
  mobileNo: string;
  institution?: string;
  uid?: string;
  classLevel?: string;
  stream?: string;
  subjects?: string[];
  
  // Parent Details
  fatherName?: string;
  fatherOccupation?: string;
  fatherMobile?: string;
  fatherEmail?: string;
  motherName?: string;
  motherOccupation?: string;
  motherMobile?: string;
  motherEmail?: string;

  // Targets
  targetedExams?: string[];
  targetedInstitutions?: string[];
  targetedCountries?: string[];
  targetedCourses?: string[];
  otherTargets?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
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
  { timestamps: true }
);

const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
