import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface TaskDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo: string | null;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<TaskDocument> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    priority: { type: String, required: true },
    status: { type: String, required: true },
    assignedTo: { type: String, required: false },
    tags: { type: [String], required: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

export const TaskModel: Model<TaskDocument> =
  mongoose.models.Task || mongoose.model<TaskDocument>("Task", TaskSchema);
