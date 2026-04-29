import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITestGrade extends Document {
  testId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marks: Record<string, any>;
  remarks?: string;
}

const TestGradeSchema: Schema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'AcademicTest', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    marks: { type: Schema.Types.Mixed, required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

const TestGrade: Model<ITestGrade> =
  mongoose.models.TestGrade || mongoose.model<ITestGrade>('TestGrade', TestGradeSchema);

export default TestGrade;
