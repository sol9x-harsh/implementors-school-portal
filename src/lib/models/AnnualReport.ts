import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnnualReport extends Document {
  cohortValue: string;
  cohortLabel: string;
  studentCount: number;
  generatedAt: Date;
  status: 'complete' | 'failed';
  generatedBy?: string;
}

const AnnualReportSchema: Schema = new Schema({
  cohortValue: { type: String, required: true },
  cohortLabel: { type: String, required: true },
  studentCount: { type: Number, required: true },
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['complete', 'failed'], default: 'complete' },
  generatedBy: { type: String },
});

const AnnualReport: Model<IAnnualReport> =
  mongoose.models.AnnualReport ||
  mongoose.model<IAnnualReport>('AnnualReport', AnnualReportSchema);

export default AnnualReport;
