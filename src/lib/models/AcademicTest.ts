import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAcademicTest extends Document {
  name: string;
  date: Date;
  targetClass?: string;
  targetStream?: string;
  targetSchool?: string;
}

const AcademicTestSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    targetClass: { type: String },
    targetStream: { type: String },
    targetSchool: { type: String },
  },
  { timestamps: true }
);

const AcademicTest: Model<IAcademicTest> =
  mongoose.models.AcademicTest || mongoose.model<IAcademicTest>('AcademicTest', AcademicTestSchema);

export default AcademicTest;
