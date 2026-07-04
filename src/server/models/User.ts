import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (this: IUser) {
  const user = this;
  if (!user.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  if (user.password) {
    user.password = await bcrypt.hash(user.password, salt);
  }
});

UserSchema.methods.comparePassword = async function (this: IUser, candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
