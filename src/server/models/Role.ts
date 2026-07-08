import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Role =
  mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
