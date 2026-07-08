import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  description?: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    module: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Permission =
  mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);
