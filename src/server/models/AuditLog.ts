import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId | string;
  action: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  device: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    device: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  }
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
