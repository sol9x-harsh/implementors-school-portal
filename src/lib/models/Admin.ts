import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['ADMIN'],
      default: 'ADMIN',
      required: true,
    },
  },
  { timestamps: true },
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
