import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  provider: 'local' | 'google' | 'github';
  providerId?: string;
  role: 'guest' | 'user' | 'moderator' | 'admin' | 'super_admin';
  status: 'pending_verification' | 'active' | 'suspended' | 'blocked' | 'deleted';
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;
  lastLogin?: Date;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  experience?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      minlength: 3, 
      maxlength: 30,
      index: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true, 
      index: true 
    },
    password: { type: String, required: function(this: any) { return this.provider === 'local'; } },
    avatar: { type: String },
    provider: { type: String, enum: ['local', 'google', 'github'], default: 'local', index: true },
    providerId: { type: String },
    role: { 
      type: String, 
      enum: ['guest', 'user', 'moderator', 'admin', 'super_admin'], 
      default: 'user', 
      index: true 
    },
    status: { 
      type: String, 
      enum: ['pending_verification', 'active', 'suspended', 'blocked', 'deleted'], 
      default: 'pending_verification', 
      index: true 
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpires: { type: Date },
    lastLogin: { type: Date },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: String, default: '' },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (this: IUser) {
  const user = this;
  if (!user.isModified('password') || !user.password) return;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.comparePassword = async function (this: IUser, candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
