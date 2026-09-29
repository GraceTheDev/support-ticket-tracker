import mongoose, { InferSchemaType, Model } from 'mongoose';

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export const STATUSES = ['Open', 'In progress', 'Resolved'] as const;

export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];
export type ActivityType = 'status_change' | 'priority_change';

const activitySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Activity message is required'],
      trim: true,
      minlength: [1, 'Activity message cannot be empty'],
    },
    type: {
      type: String,
      enum: ['status_change', 'priority_change'],
      required: true,
    },
    fromStatus: { type: String },
    toStatus: { type: String },
    fromPriority: { type: String },
    toPriority: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: Number,
      unique: true,
      required: true,
      min: 1,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: PRIORITIES,
        message: 'Priority must be one of: low, medium, high',
      },
      lowercase: true,
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Status must be one of: Open, In progress, Resolved',
      },
      default: 'Open',
    },
    activity: {
      type: [activitySchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      virtuals: false,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret.ticketNumber;
        delete ret._id;
        delete ret.ticketNumber;
        return ret;
      },
    },
  }
);

ticketSchema.index({ title: 'text' });
ticketSchema.index({ status: 1, priority: 1 });

export type ActivityDocument = InferSchemaType<typeof activitySchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export type TicketDocument = InferSchemaType<typeof ticketSchema> & {
  _id: mongoose.Types.ObjectId;
  ticketNumber: number;
  createdAt: Date;
  updatedAt: Date;
  activity: ActivityDocument[];
};

export const Ticket: Model<TicketDocument> = mongoose.model<TicketDocument>(
  'Ticket',
  ticketSchema
);
