import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDataSubmission extends Document {
  requestId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  payload: Record<string, any>;
  status: 'SUBMITTED' | 'VERIFIED';
  createdAt: Date;
  updatedAt: Date;
}

const DataSubmissionSchema: Schema = new Schema(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: 'DataRequest',
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['SUBMITTED', 'VERIFIED'],
      default: 'SUBMITTED',
      required: true,
    },
  },
  { timestamps: true },
);

const DataSubmission: Model<IDataSubmission> =
  mongoose.models.DataSubmission ||
  mongoose.model<IDataSubmission>('DataSubmission', DataSubmissionSchema);

export default DataSubmission;
