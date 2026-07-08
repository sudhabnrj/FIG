import mongoose from 'mongoose';
import { Draft, IDraft } from '../models/Draft';

export class DraftRepository {
  async findById(id: string | mongoose.Types.ObjectId): Promise<IDraft | null> {
    return Draft.findById(id).exec();
  }

  async findByUserId(userId: string | mongoose.Types.ObjectId): Promise<IDraft[]> {
    return Draft.find({ userId }).sort({ lastSaved: -1 }).exec();
  }

  async findActiveUserDraft(
    userId: string | mongoose.Types.ObjectId,
    questionId?: string | mongoose.Types.ObjectId,
    answerId?: string | mongoose.Types.ObjectId
  ): Promise<IDraft | null> {
    const query: Record<string, any> = { userId };
    if (questionId) query.questionId = questionId;
    if (answerId) query.answerId = answerId;
    return Draft.findOne(query).exec();
  }

  async create(data: Partial<IDraft>): Promise<IDraft> {
    return Draft.create(data);
  }

  async update(id: string | mongoose.Types.ObjectId, data: Partial<IDraft>): Promise<IDraft | null> {
    return Draft.findByIdAndUpdate(
      id,
      { $set: { ...data, lastSaved: new Date() } },
      { new: true }
    ).exec();
  }

  async delete(id: string | mongoose.Types.ObjectId): Promise<boolean> {
    const res = await Draft.findByIdAndDelete(id).exec();
    return res !== null;
  }

  async deleteActiveDraft(
    userId: string | mongoose.Types.ObjectId,
    questionId?: string | mongoose.Types.ObjectId,
    answerId?: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    const query: Record<string, any> = { userId };
    if (questionId) query.questionId = questionId;
    if (answerId) query.answerId = answerId;
    const res = await Draft.deleteOne(query).exec();
    return res.deletedCount > 0;
  }
}

export const draftRepository = new DraftRepository();
