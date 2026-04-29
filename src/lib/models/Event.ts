import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface LinkedActivity {
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  url?: string;
}

interface LinkedExternalEvent {
  title: string;
  url?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface IEvent extends Document {
  title: string;
  description?: string;
  externalUrl?: string;
  eventDate?: Date;
  targetAudience: string[];
  linkedTests: Types.ObjectId[];
  linkedActivities: LinkedActivity[];
  linkedExternalEvents: LinkedExternalEvent[];
}

const LinkedActivitySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    url: { type: String },
  },
  { _id: false },
);

const LinkedExternalEventSchema = new Schema(
  {
    title: { type: String, required: true },
    url: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false },
);

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    externalUrl: { type: String },
    eventDate: { type: Date },
    targetAudience: [{ type: String }],
    linkedTests: [{ type: Schema.Types.ObjectId, ref: 'AcademicTest' }],
    linkedActivities: [LinkedActivitySchema],
    linkedExternalEvents: [LinkedExternalEventSchema],
  },
  { timestamps: true },
);

// Prevent mongoose from recompiling the model upon hot reload
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
