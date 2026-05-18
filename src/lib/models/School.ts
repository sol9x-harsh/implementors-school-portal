import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchool extends Document {
  name: string;
  address?: string;
  contactNumber?: string;
  contactEmail?: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    contactNumber: { type: String },
    contactEmail: { type: String },
    website: { type: String },
  },
  { timestamps: true }
);

const School: Model<ISchool> = mongoose.models.School || mongoose.model<ISchool>('School', SchoolSchema);

export default School;
