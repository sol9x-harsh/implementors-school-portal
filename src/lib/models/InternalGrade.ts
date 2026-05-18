import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInternalGrade extends Document {
  studentId: mongoose.Types.ObjectId;
  term: 'Term 1' | 'Term 2' | 'Final';
  academicYear: string; // e.g., '2026-2027'
  marks: Record<string, number>; // { 'Math': 95, 'Physics': 88 }
}

const InternalGradeSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    term: {
      type: String,
      enum: ['Term 1', 'Term 2', 'Final'],
      required: true,
    },
    academicYear: { type: String, required: true },
    marks: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const InternalGrade: Model<IInternalGrade> =
  mongoose.models.InternalGrade || mongoose.model<IInternalGrade>('InternalGrade', InternalGradeSchema);

export default InternalGrade;
