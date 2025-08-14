import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<UserDocument> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "user"] },
  },
  { timestamps: true }
);

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
