import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export interface HistoryEntry {
  from: TaskStatus;
  to: TaskStatus;
  at: Date;
  by: Types.ObjectId; // User ID
}

export interface TaskDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: Types.ObjectId | null; // ref: User
  assignedBy: Types.ObjectId | null; // ref: User
  tags: string[];
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdBy: Types.ObjectId; // ref: User
  createdAt: Date;
  updatedAt: Date;
  history: HistoryEntry[];
}

const TaskSchema: Schema<TaskDocument> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      required: true,
      default: "pending",
    },

    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    assignedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    tags: { type: [String], default: [] },

    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    history: {
      type: [
        {
          from: {
            type: String,
            enum: ["pending", "in_progress", "completed", "cancelled"],
            required: true,
          },
          to: {
            type: String,
            enum: ["pending", "in_progress", "completed", "cancelled"],
            required: true,
          },
          at: { type: Date, required: true },
          by: { type: Schema.Types.ObjectId, ref: "User", required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// analyticlar uchun foydali indexelashlar
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ createdAt: 1 });
TaskSchema.index({ tags: 1 });

export const TaskModel: Model<TaskDocument> =
  mongoose.models.Task || mongoose.model<TaskDocument>("Task", TaskSchema);
