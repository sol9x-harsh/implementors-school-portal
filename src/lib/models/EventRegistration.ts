import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventRegistration extends Document {
  studentId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: 'REGISTERED' | 'VERIFIED';
  claimedRank?: string;
  certificateUrl?: string;
}

const EventRegistrationSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: {
      type: String,
      enum: ['REGISTERED', 'VERIFIED'],
      default: 'REGISTERED',
      required: true,
    },
    claimedRank: { type: String },
    certificateUrl: { type: String },
  },
  { timestamps: true }
);

const EventRegistration: Model<IEventRegistration> =
  mongoose.models.EventRegistration || mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);

export default EventRegistration;
