import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDataRequest extends Document {
  title: string;
  deadline?: Date;
  targetAudience: string[];
  formSchema: Record<string, any>; // JSON schema defining the dynamic fields
}

const DataRequestSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    deadline: { type: Date },
    targetAudience: [{ type: String }],
    formSchema: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const DataRequest: Model<IDataRequest> =
  mongoose.models.DataRequest || mongoose.model<IDataRequest>('DataRequest', DataRequestSchema);

export default DataRequest;
